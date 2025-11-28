import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

const mount = () => {
  const container = document.getElementById("root");
  if (!container) {
    console.error("Failed to find the root element. Ensure index.html has a <div id='root'></div>");
    return;
  }
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", mount);
} else {
  mount();
}