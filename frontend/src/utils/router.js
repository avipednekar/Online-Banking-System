import { useEffect, useState } from "react";

const PUBLIC_PATHS = new Set(["/", "/login", "/register"]);

function normalizePathname(pathname) {
  if (!pathname) {
    return "/";
  }

  return PUBLIC_PATHS.has(pathname) ? pathname : "/";
}

export function getCurrentPath() {
  if (typeof window === "undefined") {
    return "/";
  }

  return normalizePathname(window.location.pathname);
}

export function navigateTo(path, { replace = false } = {}) {
  if (typeof window === "undefined") {
    return;
  }

  const nextPath = normalizePathname(path);
  const currentPath = normalizePathname(window.location.pathname);

  if (currentPath === nextPath) {
    return;
  }

  const method = replace ? "replaceState" : "pushState";
  window.history[method](window.history.state, "", nextPath);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

export function useBrowserPath() {
  const [path, setPath] = useState(() => getCurrentPath());

  useEffect(() => {
    function handleLocationChange() {
      setPath(getCurrentPath());
    }

    window.addEventListener("popstate", handleLocationChange);
    return () => window.removeEventListener("popstate", handleLocationChange);
  }, []);

  return path;
}
