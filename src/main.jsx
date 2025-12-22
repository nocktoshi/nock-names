import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import App from "./App.jsx";
import "./index.css";
import { queryClient } from "./lib/query-client";

import berkeleyRegularUrl from "./assets/BerkeleyMono-Regular.ttf?url";
import berkeleyBoldUrl from "./assets/BerkeleyMono-Bold.ttf?url";
import berkeleyObliqueUrl from "./assets/BerkeleyMono-Oblique.ttf?url";
import berkeleyBoldObliqueUrl from "./assets/BerkeleyMono-Bold-Oblique.ttf?url";

function preloadFont(href) {
  if (typeof document === "undefined") return;
  if (!href) return;

  // Avoid duplicating tags (in case of HMR or re-entry).
  const existing = document.querySelector(`link[data-preload-font="1"][href="${href}"]`);
  if (existing) return;

  const link = document.createElement("link");
  link.rel = "preload";
  link.as = "font";
  link.type = "font/ttf";
  link.crossOrigin = "anonymous";
  link.href = href;
  link.dataset.preloadFont = "1";
  document.head.appendChild(link);
}

async function waitForBrandFont({ timeoutMs = 1400 } = {}) {
  // Avoid blocking on browsers that don't support the Font Loading API.
  if (!document.fonts || typeof document.fonts.load !== "function") return;

  const timeout = new Promise((resolve) => setTimeout(resolve, timeoutMs));

  // Berkeley Mono is used as the primary font; load normal + bold.
  // Using a tiny size keeps it fast while still triggering the fetch.
  const load = Promise.allSettled([
    document.fonts.load('400 12px "Berkeley Mono"'),
    document.fonts.load('700 12px "Berkeley Mono"'),
  ]);

  await Promise.race([load, timeout]);
}

function hideAppLoader() {
  const el = document.getElementById("app-loader");
  if (!el) return;
  el.classList.add("fade-out");
  window.setTimeout(() => el.remove(), 450);
}

(async () => {
  // Hint the browser early (before the Font Loading API waits) to fetch the font files.
  preloadFont(berkeleyRegularUrl);
  preloadFont(berkeleyBoldUrl);
  preloadFont(berkeleyObliqueUrl);
  preloadFont(berkeleyBoldObliqueUrl);

  // Keep the loader visible while the font is fetched to avoid a flash/glitch.
  await waitForBrandFont();

  createRoot(document.getElementById("root")).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </StrictMode>
  );

  // Let the first paint happen, then fade the loader out.
  requestAnimationFrame(() => hideAppLoader());
})();
