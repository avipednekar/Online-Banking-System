import { navigateTo } from "../../utils/router";

function isModifiedEvent(event) {
  return event.metaKey || event.altKey || event.ctrlKey || event.shiftKey;
}

export function RouteLink({ to, onClick, children, ...rest }) {
  function handleClick(event) {
    onClick?.(event);

    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      isModifiedEvent(event) ||
      rest.target === "_blank"
    ) {
      return;
    }

    event.preventDefault();
    navigateTo(to);
  }

  return (
    <a href={to} onClick={handleClick} {...rest}>
      {children}
    </a>
  );
}
