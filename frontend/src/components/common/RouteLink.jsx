import { Link } from "react-router-dom";

export function RouteLink({ to, onClick, children, ...rest }) {
  return (
    <Link to={to} onClick={onClick} {...rest}>
      {children}
    </Link>
  );
}
