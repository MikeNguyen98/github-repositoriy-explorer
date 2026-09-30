import SearchBar from "@/components/shared/SearchBar";
import { SignInButton } from "@/components/shared/SignInButton";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useRecentSearches } from "@/hooks/useRecentSearches";
import { recentSearches } from "@/libs/recentSearches";
import { ArrowUpDown, BookOpenText, History, KeyRound, X } from "lucide-react";
import { Link } from "react-router";

const SUGGESTIONS = ["torvalds", "gaearon", "sindresorhus", "vercel", "microsoft"];

const FEATURES = [
  {
    icon: ArrowUpDown,
    title: "Sort that actually works",
    body: "Order by stars, forks, recent pushes or name, and filter repositories by name.",
  },
  {
    icon: BookOpenText,
    title: "READMEs & languages",
    body: "Open any repository to read its README and see a full language breakdown.",
  },
  {
    icon: KeyRound,
    title: "Sign in with GitHub",
    body: "See your private repositories and stars with a 5,000 requests/hour quota.",
  },
];

const chip =
  "inline-flex items-center gap-1 rounded-full border bg-card px-3 py-1 text-sm transition-colors hover:border-brand/40 hover:text-brand";

const Home = () => {
  useDocumentTitle();
  const recent = useRecentSearches();
  const { isSignedIn, viewer } = useAuth();

  return (
    <div className="relative isolate overflow-hidden">
      {/* decorative glow */}
      <div
        aria-hidden
        className="absolute inset-x-0 -top-40 -z-10 flex justify-center blur-3xl"
      >
        <div className="aspect-[1.6] w-[48rem] bg-linear-to-tr from-indigo-400 to-fuchsia-400 opacity-25 [clip-path:polygon(50%_0%,100%_38%,82%_100%,18%_100%,0%_38%)] dark:opacity-15" />
      </div>

      <section className="mx-auto flex max-w-3xl flex-col items-center px-4 pt-20 pb-16 text-center sm:pt-28">
        <span className="animate-in fade-in rounded-full border bg-background/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
          Powered by the GitHub REST API
        </span>
        <h1 className="mt-6 animate-in text-4xl font-bold tracking-tight text-balance fade-in slide-in-from-bottom-2 sm:text-6xl">
          Explore any GitHub profile,{" "}
          <span className="bg-linear-to-r from-indigo-500 to-fuchsia-500 bg-clip-text text-transparent">
            one repo at a time
          </span>
        </h1>
        <p className="mt-5 max-w-xl text-lg text-pretty text-muted-foreground">
          Search a username to browse their repositories — sorted by stars, forks or
          activity — and dive into READMEs and language stats.
        </p>

        <SearchBar size="lg" autoFocus className="mt-10 max-w-xl" />

        <div className="mt-6 flex max-w-xl flex-col items-center gap-3">
          {recent.length > 0 ? (
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                <History className="size-4" /> Recent:
              </span>
              {recent.map((u) => (
                <span key={u} className={chip}>
                  <Link to={`/users/${encodeURIComponent(u)}`}>{u}</Link>
                  <button
                    type="button"
                    aria-label={`Remove ${u} from recent searches`}
                    onClick={() => recentSearches.remove(u)}
                    className="-mr-1 rounded-full p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <X className="size-3" />
                  </button>
                </span>
              ))}
              <Button variant="link" size="sm" onClick={recentSearches.clear}>
                Clear
              </Button>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="text-sm text-muted-foreground">Try:</span>
              {SUGGESTIONS.map((u) => (
                <Link key={u} to={`/users/${u}`} className={chip}>
                  {u}
                </Link>
              ))}
            </div>
          )}

          {!isSignedIn ? (
            <SignInButton className="mt-4 rounded-full">Sign in with GitHub</SignInButton>
          ) : (
            viewer && (
              <Link
                to={`/users/${viewer.login}`}
                className="mt-4 inline-flex items-center gap-3 rounded-full border bg-card py-1.5 pr-4 pl-1.5 text-sm shadow-sm transition-colors hover:border-brand/40"
              >
                <img src={viewer.avatar_url} alt="" className="size-7 rounded-full" />
                Continue as <span className="font-semibold">@{viewer.login}</span>
              </Link>
            )
          )}
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-4 px-4 pb-24 sm:grid-cols-3 sm:px-6">
        {FEATURES.map(({ icon: Icon, title, body }) => (
          <div key={title} className="rounded-xl border bg-card/60 p-6 backdrop-blur">
            <div className="flex size-10 items-center justify-center rounded-lg bg-brand/10 text-brand">
              <Icon className="size-5" />
            </div>
            <h2 className="mt-4 font-semibold">{title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{body}</p>
          </div>
        ))}
      </section>
    </div>
  );
};

export default Home;
