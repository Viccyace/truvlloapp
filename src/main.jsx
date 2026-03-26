import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";

import { AuthProvider } from "./providers/AuthProvider";
import { BudgetProvider } from "./providers/BudgetProvider";
import { router } from "./router";
import Preloader from "./components/Preloader";

import "./index.css";

if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      const reg = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
      });

      reg.addEventListener("updatefound", () => {
        const newSW = reg.installing;
        if (!newSW) return;
        newSW.addEventListener("statechange", () => {
          if (
            newSW.state === "installed" &&
            navigator.serviceWorker.controller
          ) {
            console.log("[SW] New version available — reload to update");
          }
          if (newSW.state === "activated") {
            console.log("[SW] App is ready for offline use");
          }
        });
      });

      console.log("[SW] Registered:", reg.scope);
    } catch (err) {
      console.warn("[SW] Registration failed:", err);
    }
  });
}

function Root() {
  const [preloaderDone, setPreloaderDone] = useState(false);

  return (
    <>
      <Preloader onDone={() => setPreloaderDone(true)} />
      <div style={{ visibility: preloaderDone ? "visible" : "hidden" }}>
        <AuthProvider>
          <BudgetProvider>
            <RouterProvider router={router} />
          </BudgetProvider>
        </AuthProvider>
      </div>
    </>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);

if (import.meta.hot) {
  import.meta.hot.accept();
}
