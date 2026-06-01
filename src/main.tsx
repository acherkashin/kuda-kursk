import React from "react";
import { createRoot } from "react-dom/client";
import "maplibre-gl/dist/maplibre-gl.css";
import "./styles/index.css";
import { AppRouter } from "./app/router";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element #root was not found");
}

createRoot(rootElement).render(
  <React.StrictMode>
    <AppRouter />
  </React.StrictMode>
);
