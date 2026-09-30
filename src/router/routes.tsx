import { AppLayout } from "@/components/layout/AppLayout";
import { ReactRouter7Adapter } from "@/libs/ReactRouter7Adapter";
import { lazy } from "react";
import { BrowserRouter, Route, Routes } from "react-router";
import { QueryParamProvider } from "use-query-params";
import * as paths from "./paths";

const Home = lazy(() => import("@/pages/Home"));
const UserPage = lazy(() => import("@/pages/user/UserPage"));
const RepoPage = lazy(() => import("@/pages/repo/RepoPage"));
const NotFound = lazy(() => import("@/pages/NotFound"));

export default function Router() {
  return (
    <BrowserRouter>
      <QueryParamProvider adapter={ReactRouter7Adapter}>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path={paths.HOME} element={<Home />} />
            <Route path={paths.USER} element={<UserPage />} />
            <Route path={paths.REPO} element={<RepoPage />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </QueryParamProvider>
    </BrowserRouter>
  );
}
