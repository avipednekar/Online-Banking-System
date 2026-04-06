import { useCallback, useMemo, useState } from "react";

export function useAsyncTracker() {
  const [pendingActions, setPendingActions] = useState([]);

  const startAction = useCallback((action) => {
    setPendingActions((current) => (current.includes(action) ? current : [...current, action]));
  }, []);

  const finishAction = useCallback((action) => {
    setPendingActions((current) => current.filter((entry) => entry !== action));
  }, []);

  const isPending = useCallback(
    (action) => pendingActions.includes(action),
    [pendingActions]
  );

  return useMemo(
    () => ({
      pendingActions,
      isBusy: pendingActions.length > 0,
      isPending,
      primaryAction: pendingActions[0] || "",
      startAction,
      finishAction
    }),
    [finishAction, isPending, pendingActions, startAction]
  );
}
