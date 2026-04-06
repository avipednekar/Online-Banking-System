import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { adminService } from "../services/adminService";
import { useAsyncTracker } from "./useAsyncTracker";
import { useToast } from "./useToast";
import { collectFieldErrors } from "../utils/formatters";

const DEFAULT_CUSTOMER_PAGE_SIZE = 25;

function isAbortError(error) {
  return error?.name === "AbortError";
}

export function useAdminWorkspace() {
  const { user, logout, getValidAccessToken } = useAuth();
  const { notifyError, notifyInfo, notifySuccess } = useToast();
  const tracker = useAsyncTracker();
  const { startAction, finishAction } = tracker;
  const [overview, setOverview] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [accountRequests, setAccountRequests] = useState([]);
  const [customerPage, setCustomerPage] = useState(0);
  const [customerPageSize, setCustomerPageSize] = useState(DEFAULT_CUSTOMER_PAGE_SIZE);
  const [customerTotalPages, setCustomerTotalPages] = useState(0);
  const [customerTotalElements, setCustomerTotalElements] = useState(0);
  const [customerSearchDraft, setCustomerSearchDraft] = useState("");
  const [customerSearchQuery, setCustomerSearchQuery] = useState("");
  const [customerKycFilter, setCustomerKycFilter] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [selectedCustomerDetail, setSelectedCustomerDetail] = useState(null);
  const [selectedCustomerError, setSelectedCustomerError] = useState("");
  const [overviewError, setOverviewError] = useState("");
  const [customersError, setCustomersError] = useState("");
  const [requestsError, setRequestsError] = useState("");
  const [overviewLoaded, setOverviewLoaded] = useState(false);
  const [customersLoaded, setCustomersLoaded] = useState(false);
  const [requestsLoaded, setRequestsLoaded] = useState(false);
  const customerRequestIdRef = useRef(0);
  const detailRequestIdRef = useRef(0);
  const customerQueryRef = useRef({
    page: 0,
    size: DEFAULT_CUSTOMER_PAGE_SIZE,
    search: "",
    kycStatus: ""
  });
  const initStartedRef = useRef(false);

  const pendingRequestByCustomerId = useMemo(
    () =>
      new Map(
        accountRequests
          .filter((request) => String(request.status || "").toUpperCase() === "PENDING")
          .map((request) => [request.requesterId, request])
      ),
    [accountRequests]
  );

  const handleSessionError = useCallback(
    (error, title) => {
      if (isAbortError(error)) {
        return true;
      }

      if (error.status === 401) {
        logout();
        notifyError("Session expired", error.message || "Please sign in again.");
        return true;
      }

      notifyError(title, error.message || "Request failed", collectFieldErrors(error.fields));
      return false;
    },
    [logout, notifyError]
  );

  const loadOverview = useCallback(async () => {
    startAction("overview");
    setOverviewError("");
    try {
      const accessToken = await getValidAccessToken();
      const data = await adminService.getOverview(accessToken);
      setOverview(data);
      setOverviewLoaded(true);
    } catch (error) {
      if (!handleSessionError(error, "Unable to load admin overview")) {
        setOverviewError(error.message || "Unable to load admin overview.");
      }
    } finally {
      finishAction("overview");
    }
  }, [finishAction, getValidAccessToken, handleSessionError, startAction]);

  const loadCustomers = useCallback(
    async ({
      signal,
      page,
      size,
      search,
      kycStatus
    } = {}) => {
      const resolvedPage = page ?? customerQueryRef.current.page;
      const resolvedSize = size ?? customerQueryRef.current.size;
      const resolvedSearch = search ?? customerQueryRef.current.search;
      const resolvedKycStatus = kycStatus ?? customerQueryRef.current.kycStatus;
      const requestId = ++customerRequestIdRef.current;
      startAction("customers");
      setCustomersError("");
      try {
        const accessToken = await getValidAccessToken();
        const data = await adminService.getCustomers(accessToken, {
          page: resolvedPage,
          size: resolvedSize,
          search: resolvedSearch,
          kycStatus: resolvedKycStatus,
          signal
        });

        if (signal?.aborted || requestId !== customerRequestIdRef.current) {
          return;
        }

        setCustomers(Array.isArray(data?.content) ? data.content : []);
        setCustomerTotalPages(Number(data?.totalPages || 0));
        setCustomerTotalElements(Number(data?.totalElements || 0));
        setCustomersLoaded(true);
      } catch (error) {
        if (!handleSessionError(error, "Unable to load customer registry")) {
          setCustomersError(error.message || "Unable to load customer registry.");
        }
      } finally {
        finishAction("customers");
      }
    },
    [finishAction, getValidAccessToken, handleSessionError, startAction]
  );

  const loadAccountRequests = useCallback(async () => {
    startAction("accountRequests");
    setRequestsError("");
    try {
      const accessToken = await getValidAccessToken();
      const data = await adminService.getAccountRequests(accessToken);
      setAccountRequests(data);
      setRequestsLoaded(true);
    } catch (error) {
      if (!handleSessionError(error, "Unable to load account request queue")) {
        setRequestsError(error.message || "Unable to load account request queue.");
      }
    } finally {
      finishAction("accountRequests");
    }
  }, [finishAction, getValidAccessToken, handleSessionError, startAction]);

  const loadCustomerDetail = useCallback(
    async (userId, { signal, preserveExisting = false } = {}) => {
      if (!userId) {
        setSelectedCustomerId(null);
        setSelectedCustomerDetail(null);
        setSelectedCustomerError("");
        return null;
      }

      const requestId = ++detailRequestIdRef.current;
      startAction("customerDetail");
      setSelectedCustomerError("");
      setSelectedCustomerId(userId);
      if (!preserveExisting) {
        setSelectedCustomerDetail(null);
      }
      try {
        const accessToken = await getValidAccessToken();
        const detail = await adminService.getCustomerDetail(accessToken, userId, { signal });

        if (signal?.aborted || requestId !== detailRequestIdRef.current) {
          return null;
        }

        setSelectedCustomerDetail(detail);
        return detail;
      } catch (error) {
        if (!handleSessionError(error, "Unable to load customer detail")) {
          setSelectedCustomerError(error.message || "Unable to load customer detail.");
        }
        return null;
      } finally {
        finishAction("customerDetail");
      }
    },
    [finishAction, getValidAccessToken, handleSessionError, startAction]
  );

  useEffect(() => {
    customerQueryRef.current = {
      page: customerPage,
      size: customerPageSize,
      search: customerSearchQuery,
      kycStatus: customerKycFilter
    };
  }, [customerKycFilter, customerPage, customerPageSize, customerSearchQuery]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setCustomerPage(0);
      setCustomerSearchQuery(customerSearchDraft.trim());
    }, 300);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [customerSearchDraft]);

  useEffect(() => {
    const controller = new AbortController();
    loadCustomers({
      signal: controller.signal,
      page: customerPage,
      size: customerPageSize,
      search: customerSearchQuery,
      kycStatus: customerKycFilter
    });
    return () => {
      controller.abort();
    };
  }, [loadCustomers, customerPage, customerPageSize, customerSearchQuery, customerKycFilter]);

  useEffect(() => {
    if (initStartedRef.current) {
      return;
    }

    initStartedRef.current = true;

    void Promise.allSettled([loadOverview(), loadAccountRequests()]);
  }, [loadAccountRequests, loadOverview]);

  const logoutUser = useCallback(() => {
    logout();
    notifyInfo("Signed out", "You have been logged out.");
  }, [logout, notifyInfo]);

  const getPendingRequestForCustomer = useCallback(
    (userId) => pendingRequestByCustomerId.get(userId) || null,
    [pendingRequestByCustomerId]
  );

  const hasPendingAccountRequest = useCallback(
    (userId) => pendingRequestByCustomerId.has(userId),
    [pendingRequestByCustomerId]
  );

  const isKycPending = useCallback(
    (customer) => String(customer?.kycStatus || "").toUpperCase() === "PENDING",
    []
  );

  const isKycFinal = useCallback((customer) => {
    const status = String(customer?.kycStatus || "").toUpperCase();
    return status === "VERIFIED" || status === "REJECTED";
  }, []);

  const changeCustomerPage = useCallback((nextPage) => {
    setCustomerPage(Math.max(0, nextPage));
  }, []);

  const changeCustomerPageSize = useCallback((nextSize) => {
    setCustomerPage(0);
    setCustomerPageSize(Number(nextSize));
  }, []);

  const changeCustomerSearchDraft = useCallback((value) => {
    setCustomerSearchDraft(value);
  }, []);

  const changeCustomerKycFilter = useCallback((value) => {
    setCustomerPage(0);
    setCustomerKycFilter(value || "");
  }, []);

  const closeCustomerDetail = useCallback(() => {
    detailRequestIdRef.current += 1;
    setSelectedCustomerId(null);
    setSelectedCustomerDetail(null);
    setSelectedCustomerError("");
  }, []);

  const openCustomerDetail = useCallback(
    async (userId) => {
      await loadCustomerDetail(userId);
    },
    [loadCustomerDetail]
  );

  const refreshCustomerList = useCallback(async () => {
    await loadCustomers(customerQueryRef.current);
  }, [loadCustomers]);

  const updateKyc = useCallback(
    async (userId, kycStatus) => {
      startAction("kyc");
      try {
        const accessToken = await getValidAccessToken();
        const updated = await adminService.updateKyc(accessToken, userId, kycStatus);
        await Promise.all([
          loadOverview(),
          loadAccountRequests(),
          loadCustomers(customerQueryRef.current),
          selectedCustomerId === userId
            ? loadCustomerDetail(userId, { preserveExisting: true })
            : Promise.resolve()
        ]);
        notifySuccess("KYC updated", `Customer ${updated.username} marked as ${updated.kycStatus}.`);
      } catch (error) {
        handleSessionError(error, "KYC update failed");
      } finally {
        finishAction("kyc");
      }
    },
    [
      finishAction,
      getValidAccessToken,
      handleSessionError,
      loadAccountRequests,
      loadCustomerDetail,
      loadCustomers,
      loadOverview,
      notifySuccess,
      selectedCustomerId,
      startAction
    ]
  );

  const approveAccountRequest = useCallback(
    async (requestId) => {
      startAction("approveAccountRequest");
      try {
        const accessToken = await getValidAccessToken();
        const approved = await adminService.approveAccountRequest(accessToken, requestId);
        await Promise.all([
          loadOverview(),
          loadAccountRequests(),
          loadCustomers(customerQueryRef.current),
          selectedCustomerId
            ? loadCustomerDetail(selectedCustomerId, { preserveExisting: true })
            : Promise.resolve()
        ]);
        notifySuccess(
          "Account approved",
          `Account ${approved.approvedAccountNumber} opened for ${approved.requesterUsername}.`
        );
      } catch (error) {
        handleSessionError(error, "Account approval failed");
      } finally {
        finishAction("approveAccountRequest");
      }
    },
    [
      finishAction,
      getValidAccessToken,
      handleSessionError,
      loadAccountRequests,
      loadCustomerDetail,
      loadCustomers,
      loadOverview,
      notifySuccess,
      selectedCustomerId,
      startAction
    ]
  );

  return {
    user,
    overview,
    customers,
    accountRequests,
    pendingRequestByCustomerId,
    customerPage,
    customerPageSize,
    customerTotalPages,
    customerTotalElements,
    customerSearchDraft,
    customerSearchQuery,
    customerKycFilter,
    selectedCustomerId,
    selectedCustomerDetail,
    selectedCustomerError,
    overviewError,
    customersError,
    requestsError,
    overviewLoaded,
    customersLoaded,
    requestsLoaded,
    tracker,
    logoutUser,
    loadOverview,
    loadCustomers,
    loadAccountRequests,
    loadCustomerDetail,
    refreshCustomerList,
    updateKyc,
    approveAccountRequest,
    getPendingRequestForCustomer,
    hasPendingAccountRequest,
    isKycPending,
    isKycFinal,
    setCustomerPage: changeCustomerPage,
    setCustomerPageSize: changeCustomerPageSize,
    setCustomerSearchDraft: changeCustomerSearchDraft,
    setCustomerKycFilter: changeCustomerKycFilter,
    openCustomerDetail,
    closeCustomerDetail
  };
}
