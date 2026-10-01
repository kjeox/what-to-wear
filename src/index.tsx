import React from "react";
import { createRoot } from "react-dom/client";

// Side-effect import, first so the console/network hooks are installed before
// any other module can log. `clientLogger` auto-installs on load and streams
// browser errors to the dev server's /__client_log middleware, which appends
// them to logs/frontend.ndjson - the channel AGENTS.md tells the agent to read
// instead of asking the user to open DevTools. Without this import the module
// was never evaluated, so that file never existed and the agent read nothing.
import "./utils/clientLogger";

import App from "./App";
import { ConsoleLogDrawer } from "./components/ConsoleLogDrawer";
import { taruviClient } from "./taruviClient";

/**
 * Hash parameter the build platform uses to hand this app a TaruviBase session
 * when it opens the preview, so the iframe starts signed in. The token is
 * adopted into the SDK's own storage and stripped from the URL before React
 * mounts; a fragment never reaches the server or the dev-server logs.
 */
const PREVIEW_SESSION_PARAM = "taruvi_session";

function adoptPreviewSession(): void {
  const hash = window.location.hash.startsWith("#") ? window.location.hash.slice(1) : "";
  if (!hash) return;
  const params = new URLSearchParams(hash);
  const token = params.get(PREVIEW_SESSION_PARAM);
  if (!token) return;
  taruviClient.tokenClient.setTokens({ sessionToken: token });
  params.delete(PREVIEW_SESSION_PARAM);
  const rest = params.toString();
  window.history.replaceState(
    window.history.state,
    "",
    `${window.location.pathname}${window.location.search}${rest ? `#${rest}` : ""}`,
  );
}

adoptPreviewSession();

// Mount ConsoleLogDrawer in its own root before the main app so it can capture
// errors that occur during App's initial render. No flushSync needed - at module
// load time React renders synchronously on the first paint anyway.
const drawerContainer = document.getElementById("console-log-drawer-root") as HTMLElement;
createRoot(drawerContainer).render(<ConsoleLogDrawer />);

const container = document.getElementById("root") as HTMLElement;
createRoot(container).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
