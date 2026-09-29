import { Suspense } from "react";
import "./App.css";
import { Fallback } from "./pages";
import Router from "./router";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./libs/queryClient.ts";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ErrorBoundary } from "./components/shared/ErrorBoundary";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary area="App">
        <Suspense fallback={<Fallback />}>
          <Router />
        </Suspense>
      </ErrorBoundary>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
