import { useState } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";

import { AuthProvider } from "./providers/AuthProvider";
import { router } from "./router";
import Preloader from "./components/Preloader";
import InstallPrompt from "./components/InstallPrompt";

// TEMP: keep service worker disabled while debugging redirect/auth loops
// if ("serviceWorker" in navigator) {
//   window.addEventListener("load", () => {
//     navigator.serviceWorker.register("/sw.js").catch(() => {});
//   });
// }

function Root() {
  const [preloaderDone, setPreloaderDone] = useState(false);

  return (
    <>
      <Preloader onDone={() => setPreloaderDone(true)} />
      <div style={{ visibility: preloaderDone ? "visible" : "hidden" }}>
        <AuthProvider>
          <RouterProvider router={router} />
          <InstallPrompt />
        </AuthProvider>
      </div>
    </>
  );
}

createRoot(document.getElementById("root")).render(<Root />);
