import { useOutletContext } from "react-router-dom";

export function useAdminRouteWorkspace() {
  return useOutletContext();
}
