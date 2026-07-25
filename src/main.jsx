import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App.jsx";
import "./index.css";

import { AuthProvider } from "./context/AuthContext.jsx";
import { FinanceProvider } from "./context/FinanceContext.jsx";
import { PerfilProvider } from "./context/PerfilContext.jsx";
import { ReceitasProvider } from "./context/ReceitasContext.jsx";
import { SettingsProvider } from "./context/SettingsContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <SettingsProvider>
          <PerfilProvider>
            <ReceitasProvider>
              <FinanceProvider>
                <App />
              </FinanceProvider>
            </ReceitasProvider>
          </PerfilProvider>
        </SettingsProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
