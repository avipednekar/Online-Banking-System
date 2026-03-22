import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { adminService } from "../services/adminService";
import { useAsyncTracker } from "./useAsyncTracker";
import { useToast } from "./useToast";
import { collectFieldErrors } from "../utils/formatters";

export function useAdminWorkspace() {
  const { token, user, logout } = useAuth();
  const { notifyError, notifyInfo, notifySuccess } = useToast();
  const tracker = useAsyncTracker();
  const [overview, setOverview] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [overviewError, setOverviewError] = useState("");
  const [customersError, setCustomersError] = useState("");
  const deferredSearch = useDeferredValue(searchTerm);

  const filteredCustomers = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase();
    if (!query) {
      return customers;
    }

    return customers.filter((customer) =>
      [
        customer.username,
        customer.fullName,
        customer.email,
        customer.phoneNumber,
        customer.kycStatus
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
  }, [customers, deferredSearch]);

  function handleSessionError(error, title) {
    if (error.status === 401) {
      logout();
      notifyError("Session expired", error.message || "Please sign in again.");
      return true;
    }

    notifyError(title, error.message || "Request failed", collectFieldErrors(error.fields));
    return false;
  }

  async function loadOverview() {
    tracker.startAction("overview");
    setOverviewError("");
    try {
      const data = await adminService.getOverview(token);
      setOverview(data);
    } catch (error) {
      if (!handleSessionError(error, "Unable to load admin overview")) {
        setOverviewError(error.message || "Unable to load admin overview.");
      }
    } finally {
      tracker.finishAction("overview");
    }
  }

  async function loadCustomers() {
    tracker.startAction("customers");
    setCustomersError("");
    try {
      const data = await adminService.getCustomers(token);
      setCustomers(data);
    } catch (error) {
      if (!handleSessionError(error, "Unable to load customer registry")) {
        setCustomersError(error.message || "Unable to load customer registry.");
      }
    } finally {
      tracker.finishAction("customers");
    }
  }

  useEffect(() => {
    loadOverview();
    loadCustomers();
  }, []);

  function logoutUser() {
    logout();
    notifyInfo("Signed out", "You have been logged out.");
  }

  async function updateKyc(userId, kycStatus) {
    tracker.startAction("kyc");
    try {
      const updated = await adminService.updateKyc(token, userId, kycStatus);
      setCustomers((current) =>
        current.map((customer) => (customer.userId === updated.userId ? updated : customer))
      );
      await loadOverview();
      notifySuccess("KYC updated", `Customer ${updated.username} marked as ${updated.kycStatus}.`);
    } catch (error) {
      handleSessionError(error, "KYC update failed");
    } finally {
      tracker.finishAction("kyc");
    }
  }

  return {
    user,
    overview,
    customers,
    filteredCustomers,
    searchTerm,
    setSearchTerm,
    overviewError,
    customersError,
    tracker,
    logoutUser,
    loadOverview,
    loadCustomers,
    updateKyc
  };
}
