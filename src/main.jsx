import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";

import { AuthProvider } from "./providers/AuthProvider";
import { BudgetProvider } from "./providers/BudgetProvider";
import { router } from "./router";

// TEMP: keep service worker disabled while debugging
// if ("serviceWorker" in navigator) {
//   window.addEventListener("load", () => {
//     navigator.serviceWorker.register("/sw.js").catch(() => {});
//   });
// }

function Root() {
  return (
    <AuthProvider>
      <BudgetProvider>
        <RouterProvider router={router} />
      </BudgetProvider>
    </AuthProvider>
  );
}

createRoot(document.getElementById("root")).render(<Root />);

export default Root;
