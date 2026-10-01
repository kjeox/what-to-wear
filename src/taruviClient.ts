import { Client } from "@taruvi/sdk";

// Validate required environment variables. The API key is deliberately NOT
// required: browser auth is end-user session tokens managed by the SDK, and
// the constructor's apiKey is never transmitted - a real key must never be
// bundled into the client.
const requiredEnvVars = {
  TARUVI_SITE_URL: __TARUVI_SITE_URL__,
  TARUVI_APP_SLUG: __TARUVI_APP_SLUG__,
};

Object.entries(requiredEnvVars).forEach(([key, value]) => {
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${key}. ` +
        `Please check your .env.local file. See .env.example for required variables.`
    );
  }
});

/**
 * Taruvi Client instance configured with environment variables.
 * Participant-facing setup uses TARUVI_* variables injected into the client
 * build through Vite configuration.
 * Used for Navkit, DataProviders, and direct SDK operations.
 *
 * @example
 * // Use with Refine providers (recommended)
 * import { taruviDataProvider, taruviAuthProvider } from "./providers/refineProviders";
 *
 * @example
 * // Direct SDK usage (advanced)
 * import { taruviClient } from "./taruviClient";
 * const response = await taruviClient.httpClient.get("api/...");
 *
 * @see {@link https://docs.taruvi.com|Taruvi Documentation}
 */
export const taruviClient = (() => {
  try {
    return new Client({
      apiKey: __TARUVI_API_KEY__ || "browser",
      appSlug: __TARUVI_APP_SLUG__,
      apiUrl: __TARUVI_SITE_URL__,
    });
  } catch (error) {
    console.error("Failed to initialize Taruvi Client:", error);
    throw new Error(
      "Taruvi configuration error. Please check your .env.local file. " +
        "See .env.example for required variables."
    );
  }
})();

/**
 * Send the app session only. The SDK's axios instance is created with
 * `withCredentials: true`, so every API call also carried whatever cookie the
 * browser held for the TaruviBase host - and a developer signed in to the
 * TaruviBase console reached the app as that console account instead of the
 * app user the platform signed in, holding no role in the app and getting 403
 * on every request. Browser auth is the session token the SDK manages
 * (`X-Session-Token`); cookies add nothing here.
 */
type CookieOptOut = { axiosInstance?: { defaults: { withCredentials: boolean } } };
const httpTransport = taruviClient.httpClient as unknown as CookieOptOut;
if (httpTransport.axiosInstance) {
  httpTransport.axiosInstance.defaults.withCredentials = false;
}
