import { memo } from "react";

export const Panel = memo(function Panel({ className = "", children }) {
  return <section className={`panel ${className}`.trim()}>{children}</section>;
});
