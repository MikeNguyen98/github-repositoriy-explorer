import SearchBar from "@/components/shared/SearchBar";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { SearchX } from "lucide-react";

interface NotFoundStateProps {
  title: string;
  description: string;
}

export function NotFoundState({ title, description }: NotFoundStateProps) {
  return (
    <Empty className="py-16">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <SearchX />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent className="max-w-md">
        <SearchBar />
      </EmptyContent>
    </Empty>
  );
}
