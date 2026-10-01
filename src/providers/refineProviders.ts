import {
  dataProvider,
  authProvider,
  storageDataProvider,
  appDataProvider,
  userDataProvider,
  accessControlProvider,
} from "@taruvi/refine-providers";
import { taruviClient } from "../taruviClient";
import { ensureLoginRole, ensureLoginRoleWith } from "./ensureLoginRole";

export type { UserData as TaruviUser } from "@taruvi/sdk";
export type {
  TaruviMeta,
  TaruviListResponse,
  StorageUploadVariables,
  LoginParams,
  LogoutParams,
  RegisterParams,
  FunctionMeta,
  AnalyticsMeta,
} from "@taruvi/refine-providers";

export {
  buildRefineQueryParams,
  convertRefineFilters,
  convertRefineSorters,
  convertRefinePagination,
  buildQueryString,
  REFINE_OPERATOR_MAP,
} from "@taruvi/refine-providers";

/**
 * Refine providers for Taruvi
 *
 * - taruviDataProvider (default): Database CRUD
 * - taruviStorageProvider (storage): File upload/download/delete
 * - taruviAppProvider (app): Functions, analytics, roles, settings, secrets
 * - taruviUserProvider (user): User CRUD and roles
 * - taruviAuthProvider: Authentication
 * - taruviAccessControlProvider: Cerbos permission checks
 */

export const taruviDataProvider = dataProvider(taruviClient);

/**
 * Credentials-aware auth provider.
 *
 * The package provider's `login` ignores its params and always performs the
 * hosted redirect to `<site>/accounts/login/`. That page sends
 * `X-Frame-Options: DENY`, so inside the platform's preview iframe the
 * redirect lands on a page the browser refuses to render and the preview
 * stays blank.
 *
 * Taruvi serves django-allauth's headless app API (the SDK's own session
 * check hits `_allauth/app/v1/auth/session`), so login/signup are plain JSON
 * endpoints returning a `session_token` — the same token the SDK's
 * HttpClient sends as `X-Session-Token`. Signing in via the API keeps the
 * whole flow inside the app with no cross-origin navigation. When no
 * credentials are passed, the package provider's hosted redirect flow is
 * used as before, so the standalone experience is unchanged.
 */
interface AllauthFlow {
  id: string;
  is_pending?: boolean;
}

interface AllauthBody {
  status: number;
  meta?: { session_token?: string; is_authenticated?: boolean };
  data?: { flows?: AllauthFlow[] };
  errors?: Array<{ message: string; param?: string }>;
}

interface CredentialParams {
  email?: string;
  username?: string;
  password?: string;
  redirect?: boolean;
  callbackUrl?: string;
}

const PENDING_FLOW_MESSAGES: Record<string, string> = {
  verify_email: "Check your inbox and verify your email address, then sign in.",
  mfa_authenticate: "This account requires two-factor authentication, which this app does not support yet.",
};

function allauthFailureMessage(
  errors: Array<{ message: string; param?: string }> | undefined,
  flows: AllauthFlow[] | undefined,
  fallback: string,
): string {
  const fieldError = errors?.[0]?.message;
  if (fieldError) return fieldError;
  const pending = flows?.find((flow) => flow.is_pending);
  if (pending) return PENDING_FLOW_MESSAGES[pending.id] ?? `Additional sign-in step required: ${pending.id}`;
  return fallback;
}

async function allauthAuthenticate(
  path: "login" | "signup",
  payload: Record<string, string>,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const fallback = path === "login" ? "Invalid email or password." : "Could not create the account.";
  try {
    // The SDK's HttpClient returns the parsed response body directly (not an
    // axios response), so this IS the allauth envelope.
    const body = await taruviClient.httpClient.post<AllauthBody>(
      `_allauth/app/v1/auth/${path}`,
      payload,
    );
    const token = body.meta?.session_token;
    if (token && body.meta?.is_authenticated !== false) {
      taruviClient.tokenClient.setTokens({ sessionToken: token });
      return { ok: true };
    }
    return { ok: false, message: allauthFailureMessage(body.errors, body.data?.flows, fallback) };
  } catch (error) {
    // Non-2xx responses surface as TaruviError, which carries the allauth
    // `errors` array and `data` (pending flows) verbatim.
    const sdkError = error as {
      errors?: Array<{ message: string; param?: string }>;
      data?: { flows?: AllauthFlow[] };
    };
    return { ok: false, message: allauthFailureMessage(sdkError.errors, sdkError.data?.flows, fallback) };
  }
}

const packageAuthProvider = authProvider(taruviClient);

export const taruviAuthProvider: typeof packageAuthProvider = {
  ...packageAuthProvider,
  /**
   * Assign this app's default role on every authenticated load.
   *
   * `check` is the hook Refine actually runs - `<Authenticated>` calls it on
   * each load, so it covers the in-app login form, the hosted-login redirect
   * and the platform's adopted preview session alike. `getIdentity` below is
   * NOT a reliable trigger: nothing in this template calls `useGetIdentity`,
   * and its only library consumer (`@refinedev/mui`'s `ThemedHeader`) is
   * disabled via `Header={() => null}` in App.tsx. Relying on it meant the
   * role was never assigned, so every new user hit 403 on their first write.
   */
  check: async (...args: Parameters<NonNullable<typeof packageAuthProvider.check>>) => {
    const result = await packageAuthProvider.check(...args);
    if (result?.authenticated) {
      ensureLoginRoleWith(async () => {
        const identity = await packageAuthProvider.getIdentity?.();
        return (identity as { email?: string } | null | undefined)?.email;
      });
    }
    return result;
  },
  login: async (params: CredentialParams = {}) => {
    const { email, username, password } = params;
    if (password && (email || username)) {
      const result = await allauthAuthenticate("login", {
        ...(email ? { email } : {}),
        ...(username ? { username } : {}),
        password,
      });
      if (result.ok) {
        // Do not wait for the next `check` to come round: the user is about
        // to land on a page that may write immediately. Only an email is
        // usable here - the function looks the user up by email - so a
        // username login falls through to `check`, which resolves identity.
        if (email) ensureLoginRole(email);
        return { success: true, redirectTo: "/" };
      }
      return { success: false, error: { name: "LoginError", message: result.message } };
    }
    return packageAuthProvider.login(params);
  },
  register: async (params: CredentialParams = {}) => {
    const { email, password } = params;
    if (email && password) {
      const result = await allauthAuthenticate("signup", { email, password });
      return result.ok
        ? { success: true, redirectTo: "/" }
        : { success: false, error: { name: "RegisterError", message: result.message } };
    }
    // `register` is optional on Refine's AuthProvider type; the package
    // provider defines it (hosted signup redirect), so this only guards the
    // type, not a real gap.
    return packageAuthProvider.register
      ? packageAuthProvider.register(params)
      : { success: false, error: { name: "RegisterError", message: "Registration is not available." } };
  },
  getIdentity: async () => {
    const identity = await packageAuthProvider.getIdentity?.();
    const email = (identity as { email?: string } | null | undefined)?.email;
    // Assign the default role on first authenticated load, covering every
    // sign-in path. Idempotent and fire-and-forget; never blocks identity.
    ensureLoginRole(email);
    return identity ?? null;
  },
};

export const taruviStorageProvider = storageDataProvider(taruviClient);
export const taruviAppProvider = appDataProvider(taruviClient);
export const taruviUserProvider = userDataProvider(taruviClient);
export const taruviAccessControlProvider = accessControlProvider(taruviClient);
