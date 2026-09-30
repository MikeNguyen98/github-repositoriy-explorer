import { Page } from "@/components/shared/Page";
import { NotFoundState } from "@/components/shared/NotFoundState";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

const NotFound = () => {
  useDocumentTitle("Page not found");
  return (
    <Page>
      <NotFoundState
        title="404 — Page not found"
        description="The page you're looking for doesn't exist. Search for a GitHub user instead."
      />
    </Page>
  );
};

export default NotFound;
