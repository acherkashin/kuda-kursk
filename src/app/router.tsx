import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router";
import { App } from "./App";

function MainMapRedirect() {
  const location = useLocation();

  return (
    <Navigate
      to={{ pathname: "/maps/main", search: location.search, hash: location.hash }}
      replace
    />
  );
}

export function AppRouter() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<MainMapRedirect />} />
        <Route path="/maps/:slug" element={<App />} />
        <Route path="*" element={<MainMapRedirect />} />
      </Routes>
    </BrowserRouter>
  );
}
