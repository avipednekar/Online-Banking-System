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

  const [overviewLoaded, setOverviewLoaded] = useState(false);
  const [customersLoaded, setCustomersLoaded] = useState(false);
  const [pendingTransfers, setPendingTransfers] = useState([]);
  const [pendingTransfersLoaded, setPendingTransfersLoaded] = useState(false);
  const [pendingTransfersError, setPendingTransfersError] = useState("");

  const customerRequestIdRef = useRef(0);
  const detailRequestIdRef = useRef(0);
  const customerQueryRef = useRef({
    page: 0,
    size: DEFAULT_CUSTOMER_PAGE_SIZE,
    search: "",
    kycStatus: ""
  });
  const initStartedRef = useRef(false);


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

    void Promise.allSettled([loadOverview()]);
  }, [loadOverview]);

  const logoutUser = useCallback(() => {
    logout();
    notifyInfo("Signed out", "You have been logged out.");
  }, [logout, notifyInfo]);


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
      loadCustomerDetail,
      loadCustomers,
      loadOverview,
      notifySuccess,
      selectedCustomerId,
      startAction
    ]
  );


  const loadPendingTransfers = useCallback(
    async ({ signal } = {}) => {
      startAction("pendingTransfers");
      setPendingTransfersError("");
      try {
        const accessToken = await getValidAccessToken();
        const data = await adminService.getPendingTransfers(accessToken, { page: 0, size: 50, signal });
        if (signal?.aborted) return;
        setPendingTransfers(Array.isArray(data?.content) ? data.content : []);
        setPendingTransfersLoaded(true);
      } catch (error) {
        if (!handleSessionError(error, "Unable to load pending transfers")) {
          setPendingTransfersError(error.message || "Unable to load pending transfers.");
        }
      } finally {
        finishAction("pendingTransfers");
      }
    },
    [finishAction, getValidAccessToken, handleSessionError, startAction]
  );

  const approveTransfer = useCallback(
    async (transferId) => {
      startAction("approveTransfer");
      try {
        const accessToken = await getValidAccessToken();
        const receipt = await adminService.approveTransfer(accessToken, transferId);
        await Promise.all([
          loadOverview(),
          loadPendingTransfers()
        ]);
        notifySuccess("Transfer approved", `Transfer ${receipt?.transferId || transferId} was approved and posted.`);
      } catch (error) {
        handleSessionError(error, "Transfer approval failed");
      } finally {
        finishAction("approveTransfer");
      }
    },
    [finishAction, getValidAccessToken, handleSessionError, loadOverview, loadPendingTransfers, notifySuccess, startAction]
  );

  return {
    user,
    overview,
    customers,
    pendingTransfers,
    pendingTransfersLoaded,
    pendingTransfersError,

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

    overviewLoaded,
    customersLoaded,

    tracker,
    logoutUser,
    loadOverview,
    loadCustomers,
    loadPendingTransfers,
    approveTransfer,

    loadCustomerDetail,
    refreshCustomerList,
    updateKyc,

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

