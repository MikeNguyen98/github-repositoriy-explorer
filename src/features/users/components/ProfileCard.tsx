import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { GitHubUser } from "@/features/repos/types";
import { formatCompact, formatMonthYear } from "@/libs/utils";
import {
  AtSign,
  Building2,
  CalendarDays,
  ExternalLink,
  Link2,
  MapPin,
  Users,
} from "lucide-react";
import type { ReactNode } from "react";

const MetaRow = ({ icon, children }: { icon: ReactNode; children: ReactNode }) => (
  <li className="flex min-w-0 items-center gap-2 [&>svg]:size-4 [&>svg]:shrink-0">
    {icon}
    <span className="truncate">{children}</span>
  </li>
);

export function ProfileCard({ user, isViewer }: { user: GitHubUser; isViewer?: boolean }) {
  const blog = user.blog && (user.blog.startsWith("http") ? user.blog : `https://${user.blog}`);

  return (
    <aside className="flex flex-col gap-5">
      <div className="flex items-center gap-4 lg:flex-col lg:items-start">
        <img
          src={user.avatar_url}
          alt=""
          className="size-20 shrink-0 rounded-full border shadow-sm lg:size-auto lg:w-full lg:max-w-64"
        />
        <div className="min-w-0">
          <h1 className="flex items-center gap-2 truncate text-2xl font-bold tracking-tight">
            {user.name ?? user.login}
          </h1>
          <p className="flex flex-wrap items-center gap-2 text-lg text-muted-foreground">
            {user.login}
            {isViewer && <Badge className="bg-brand text-brand-foreground">You</Badge>}
            {user.type === "Organization" && <Badge variant="secondary">Organization</Badge>}
          </p>
        </div>
      </div>

      {user.bio && <p className="text-sm leading-relaxed">{user.bio}</p>}

      <a
        href={user.html_url}
        target="_blank"
        rel="noreferrer"
        className={buttonVariants({ variant: "outline", className: "w-full" })}
      >
        View on GitHub
        <ExternalLink data-icon="inline-end" />
      </a>

      <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Users className="size-4" />
        <span className="font-semibold text-foreground">{formatCompact(user.followers)}</span>
        followers ·
        <span className="font-semibold text-foreground">{formatCompact(user.following)}</span>
        following
      </p>

      <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
        {user.company && <MetaRow icon={<Building2 />}>{user.company}</MetaRow>}
        {user.location && <MetaRow icon={<MapPin />}>{user.location}</MetaRow>}
        {blog && (
          <MetaRow icon={<Link2 />}>
            <a href={blog} target="_blank" rel="noreferrer" className="hover:text-brand hover:underline">
              {user.blog}
            </a>
          </MetaRow>
        )}
        {user.twitter_username && (
          <MetaRow icon={<AtSign />}>
            <a
              href={`https://x.com/${user.twitter_username}`}
              target="_blank"
              rel="noreferrer"
              className="hover:text-brand hover:underline"
            >
              {user.twitter_username}
            </a>
          </MetaRow>
        )}
        <MetaRow icon={<CalendarDays />}>Joined {formatMonthYear(user.created_at)}</MetaRow>
      </ul>
    </aside>
  );
}

export function ProfileCardSkeleton() {
  return (
    <div className="flex flex-col gap-5" aria-hidden>
      <div className="flex items-center gap-4 lg:flex-col lg:items-start">
        <Skeleton className="size-20 rounded-full lg:size-64" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-5 w-28" />
        </div>
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-9 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  );
}
