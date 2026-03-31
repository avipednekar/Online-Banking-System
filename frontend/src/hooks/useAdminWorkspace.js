import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { adminService } from "../services/adminService";
import { useAsyncTracker } from "./useAsyncTracker";
import { useToast } from "./useToast";
import { collectFieldErrors } from "../utils/formatters";

export function useAdminWorkspace() {
  const { user, logout, getValidAccessToken } = useAuth();
  const { notifyError, notifyInfo, notifySuccess } = useToast();
  const tracker = useAsyncTracker();
  const [overview, setOverview] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [accountRequests, setAccountRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [overviewError, setOverviewError] = useState("");
  const [customersError, setCustomersError] = useState("");
  const [requestsError, setRequestsError] = useState("");
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
      const accessToken = await getValidAccessToken();
      const data = await adminService.getOverview(accessToken);
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
      const accessToken = await getValidAccessToken();
      const data = await adminService.getCustomers(accessToken);
      setCustomers(Array.isArray(data) ? data : data.content || []);
    } catch (error) {
      if (!handleSessionError(error, "Unable to load customer registry")) {
        setCustomersError(error.message || "Unable to load customer registry.");
      }
    } finally {
      tracker.finishAction("customers");
    }
  }

  async function loadAccountRequests() {
    tracker.startAction("accountRequests");
    setRequestsError("");
    try {
      const accessToken = await getValidAccessToken();
      const data = await adminService.getAccountRequests(accessToken);
      setAccountRequests(data);
    } catch (error) {
      if (!handleSessionError(error, "Unable to load account request queue")) {
        setRequestsError(error.message || "Unable to load account request queue.");
      }
    } finally {
      tracker.finishAction("accountRequests");
    }
  }

  useEffect(() => {
    loadOverview();
    loadCustomers();
    loadAccountRequests();
  }, []);

  function logoutUser() {
    logout();
    notifyInfo("Signed out", "You have been logged out.");
  }

  async function updateKyc(userId, kycStatus) {
    tracker.startAction("kyc");
    try {
      const accessToken = await getValidAccessToken();
      const updated = await adminService.updateKyc(accessToken, userId, kycStatus);
      setCustomers((current) =>
        current.map((customer) => (customer.userId === updated.userId ? updated : customer))
      );
      await loadOverview();
      await loadAccountRequests();
      notifySuccess("KYC updated", `Customer ${updated.username} marked as ${updated.kycStatus}.`);
    } catch (error) {
      handleSessionError(error, "KYC update failed");
    } finally {
      tracker.finishAction("kyc");
    }
  }

  async function approveAccountRequest(requestId) {
    tracker.startAction("approveAccountRequest");
    try {
      const accessToken = await getValidAccessToken();
      const approved = await adminService.approveAccountRequest(accessToken, requestId);
      setAccountRequests((current) => current.filter((request) => request.id !== approved.id));
      await loadOverview();
      await loadCustomers();
      notifySuccess("Account approved", `Account ${approved.approvedAccountNumber} opened for ${approved.requesterUsername}.`);
    } catch (error) {
      handleSessionError(error, "Account approval failed");
    } finally {
      tracker.finishAction("approveAccountRequest");
    }
  }

  return {
    user,
    overview,
    customers,
    accountRequests,
    filteredCustomers,
    searchTerm,
    setSearchTerm,
    overviewError,
    customersError,
    requestsError,
    tracker,
    logoutUser,
    loadOverview,
    loadCustomers,
    loadAccountRequests,
    updateKyc,
    approveAccountRequest
  };
}
