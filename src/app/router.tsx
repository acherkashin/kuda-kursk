import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { App } from "./App";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/maps/main" replace />} />
        <Route path="/maps/:slug" element={<App />} />
        <Route path="*" element={<Navigate to="/maps/main" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
