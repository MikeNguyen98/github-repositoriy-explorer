import { Routes, Route, BrowserRouter, Navigate } from "react-router";
import * as routePath from "./paths";
import * as routePage from "../pages";
import React from "react";
import { QueryParamProvider } from "use-query-params";
import { ReactRouter7Adapter } from "@/libs/ReactRouter7Adapter";
import Layout from "@/components/shared/Layout";

const RouteContainer = () => (
  <React.Fragment>
    <BrowserRouter>
      <QueryParamProvider adapter={ReactRouter7Adapter}>
        <Routes>
          <Route path={routePath.APP_HOME} element={<routePage.Home />} />
          <Route
            path="*"
            element={<Navigate to={routePath.APP_HOME} replace />}
          />
          <Route
            path={routePath.APP_USER_REPOS}
            element={<Layout children={<routePage.UserRepos />}/>}
          />
          <Route
            path={routePath.APP_REPO_DETAILS}
            element={<Layout children={<routePage.RepoDetails />}/>}
          />
        </Routes>
      </QueryParamProvider>
    </BrowserRouter>
  </React.Fragment>
);

export default RouteContainer;
