import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { queryClient } from "@/libs/queryClient";
import Router from "@/router";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary area="app">
        <Router />
      </ErrorBoundary>
      <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
    </QueryClientProvider>
  );
}

export default App;
