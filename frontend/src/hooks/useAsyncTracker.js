import { useMemo, useState } from "react";

export function useAsyncTracker() {
  const [pendingActions, setPendingActions] = useState([]);

  function startAction(action) {
    setPendingActions((current) => (current.includes(action) ? current : [...current, action]));
  }

  function finishAction(action) {
    setPendingActions((current) => current.filter((entry) => entry !== action));
  }

  const state = useMemo(
    () => ({
      pendingActions,
      isBusy: pendingActions.length > 0,
      isPending(action) {
        return pendingActions.includes(action);
      },
      primaryAction: pendingActions[0] || ""
    }),
    [pendingActions]
  );

  return {
    ...state,
    startAction,
    finishAction
  };
}
