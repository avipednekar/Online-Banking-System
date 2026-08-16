import { useOutletContext } from "react-router-dom";

export function useCustomerRouteWorkspace() {
  return useOutletContext();
}
