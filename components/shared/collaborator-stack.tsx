import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { User } from "@/types/app";

export function CollaboratorStack({
  users,
  className,
  limit = 4,
}: {
  users: User[];
  className?: string;
  limit?: number;
}) {
  const visibleUsers = users.slice(0, limit);
  const overflow = Math.max(users.length - limit, 0);

  return (
    <div className={cn("flex items-center", className)}>
      {visibleUsers.map((user, index) => (
        <Avatar
          key={user.id}
          className="-ml-2 first:ml-0 size-9 border-2 border-card"
          style={{ backgroundColor: `${user.color}20`, color: user.color, zIndex: visibleUsers.length - index }}
        >
          <AvatarFallback style={{ backgroundColor: `${user.color}18`, color: user.color }}>
            {user.initials}
          </AvatarFallback>
        </Avatar>
      ))}
      {overflow > 0 ? (
        <span className="ml-2 rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
          +{overflow}
        </span>
      ) : null}
    </div>
  );
}
