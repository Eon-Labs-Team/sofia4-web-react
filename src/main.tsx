import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";

import { TempoDevtools } from "tempo-devtools";
TempoDevtools.init();

// Inicializar tema
const initializeTheme = () => {
  const savedTheme = localStorage.getItem("theme");
  const root = document.documentElement;

  if (savedTheme === "dark") {
    root.classList.add("dark");
  } else if (savedTheme === "light") {
    root.classList.remove("dark");
  } else {
    // Sistema por defecto
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (systemTheme) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }
};

// Ejecutar inmediatamente para evitar flash de tema incorrecto
initializeTheme();

const basename = import.meta.env.BASE_URL;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter basename={basename}>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
