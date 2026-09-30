import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { Fallback } from "@/components/shared/Fallback";
import { Suspense } from "react";
import { Outlet, useLocation } from "react-router";
import { Footer } from "./Footer";
import { Header } from "./Header";

export function AppLayout() {
  const { pathname } = useLocation();

  return (
    <div className="flex min-h-svh flex-col">
      <a
        href="#main"
        className="sr-only z-50 rounded-md bg-background px-3 py-2 focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <Header />
      <main id="main" className="flex-1">
        {/* area changes per route, so a crash on one page resets on navigation */}
        <ErrorBoundary area={pathname}>
          <Suspense fallback={<Fallback />}>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </main>
      <Footer />
    </div>
  );
}
