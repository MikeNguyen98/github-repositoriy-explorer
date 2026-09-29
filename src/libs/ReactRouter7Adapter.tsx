import { useLocation, useNavigate } from "react-router";
import type { QueryParamAdapterComponent } from "use-query-params";

export const ReactRouter7Adapter: QueryParamAdapterComponent = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  return children({
    replace(next) {
      navigate(next.search || "?", { replace: true, state: next.state });
    },
    push(next) {
      navigate(next.search || "?", { replace: false, state: next.state });
    },
    get location() {
      return location;
    },
  });
};