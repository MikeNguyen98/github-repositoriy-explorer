
import SearchBar from "@/components/shared/SearchBar";
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyTitle,
} from "@/components/ui/empty";

const NotFound = () => {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyTitle>404 - Not Found</EmptyTitle>
        <EmptyDescription>
          The user you&apos;re looking for doesn&apos;t exist. Try searching for
          other user below.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <SearchBar />
      </EmptyContent>
    </Empty>
  );
};

export default NotFound;
