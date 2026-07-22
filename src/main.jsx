import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import { FinanceProvider } from "./context/FinanceContext.jsx";
import { SettingsProvider } from "./context/SettingsContext.jsx";

import "./index.css";

document.documentElement.removeAttribute("data-theme");
document.documentElement.style.backgroundColor = "#0F172A";
document.body.style.backgroundColor = "#0F172A";
document.body.style.color = "#FFFFFF";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <SettingsProvider>
        <FinanceProvider>
          <App />
        </FinanceProvider>
      </SettingsProvider>
    </BrowserRouter>
  </React.StrictMode>
);