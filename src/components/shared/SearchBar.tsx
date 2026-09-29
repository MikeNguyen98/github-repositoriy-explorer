import { useNavigate, useParams } from "react-router";
import { Button } from "../ui/button";
import { Field } from "../ui/field";
import { Input } from "../ui/input";
import { useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { Search } from "lucide-react";
import { useIsMobile } from "@/hooks/useIsMobile";

const SearchBar = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [searchUser, setSearchUser] = useState(username || "");
  const submit = () => {
    const value = searchUser.trim();
    if (!value) return;
    navigate(`/users/${encodeURIComponent(value)}`);
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      submit();
    }
  };

  return (
    <Field orientation="horizontal">
      <Input
        placeholder="Enter a GitHub username..."
        className="w-full flex-5"
        value={searchUser}
        onChange={(e) => setSearchUser(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <Button
        variant="outline"
        size="icon"
        aria-label="Submit"
        className="flex-1 min-w-[40px]"
        onClick={submit}
      >
        {isMobile ? <Search /> : "Search"}
      </Button>
    </Field>
  );
};

export default SearchBar;
