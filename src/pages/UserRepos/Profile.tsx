import type { GitHubUser } from "@/features/repos/types";
import { BookOpen, Building2, CalendarDays, Link2, MapPin, Users } from "lucide-react";
import { Link } from "react-router";

const Profile = ({ user }: { user: GitHubUser }) => {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 rounded-2xl border bg-card p-6 text-start">
      <div className="flex flex-col items-start gap-6 sm:flex-row">
        <img
          src={user.avatar_url}
          alt={user.login}
          className="size-24 rounded-2xl border"
        />
        <div className="min-w-0">
          <div className="flex flex-col">
            <div className="text-xl font-bold">{user.name ?? user.login}</div>
            <Link
              to={user.html_url}
              target="_blank"
              rel="noreferrer"
              className="text-primary hover:underline"
            >
              @{user.login}
            </Link>
          </div>
          {user.bio && <p className="mt-2 text-muted-foreground">{user.bio}</p>}
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
            {user.company && (
              <span className="inline-flex items-center gap-1.5">
                <Building2 className="size-4" /> {user.company}
              </span>
            )}
            {user.location && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="size-4" /> {user.location}
              </span>
            )}
            {user.blog && (
              <Link
                to={
                  user.blog.startsWith("http")
                    ? user.blog
                    : `https://${user.blog}`
                }
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-primary hover:underline"
              >
                <Link2 className="size-4" /> {user.blog}
              </Link>
            )}
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="size-4" /> Joined {new Date(user.created_at).getFullYear()}
            </span>
          </div>
        </div>
      </div>
      <div className="mt-6 grid grid-cols-3 gap-3">
        {[
          { icon: BookOpen, label: "Repositories", value: user.public_repos },
          { icon: Users, label: "Followers", value: user.followers },
          { icon: Users, label: "Following", value: user.following },
        ].map(({ icon: Icon, label, value }) => (
          <div
            key={label}
            className="rounded-xl border bg-secondary/50 p-4 text-center"
          >
            <Icon className="mx-auto size-4 text-primary" />
            <div className="mt-1 text-xl font-bold">{value.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Profile;
