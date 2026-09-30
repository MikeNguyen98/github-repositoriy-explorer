import SearchBar from "@/components/shared/SearchBar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { APP_USER_REPOS } from "@/router/paths";
import React from "react";
import { Link, useParams } from "react-router";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const params = useParams();
  return (
    <div className="w-full flex flex-col py-6 px-8 gap-4">
      <div className="flex flex-row justify-between items-center">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link to="/" />}>Home</BreadcrumbLink>
            </BreadcrumbItem>
            {Object.entries(params).map(([key, param], index) => (
              <React.Fragment key={`${key}-${param}`}>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  {index === Object.entries(params).length - 1 ? (
                    <BreadcrumbPage>{param}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink
                      render={<Link to={key === "username" ? APP_USER_REPOS.replace(`:${key}`, param || "") : ""} />}
                    >
                      {param}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
        <div className="max-w-2/5 w-full">
          <SearchBar />
        </div>
      </div>
      {children}
    </div>
  );
};

export default Layout;
