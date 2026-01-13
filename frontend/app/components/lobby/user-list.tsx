import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface User {
  id: string;
  name: string;
  role: "host" | "guest";
  status: "ready" | "waiting";
}

interface UserListProps {
  users: User[];
}

export function UserList({ users }: UserListProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          Players
          <Badge variant="secondary" className="ml-2">
            {users.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {users.map((user) => (
            <div key={user.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9 border-2 border-background">
                  <AvatarImage src={`https://avatar.vercel.sh/${user.name}.png`} />
                  <AvatarFallback>{user.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium leading-none flex items-center gap-2">
                    {user.name}
                    {user.role === "host" && (
                      <Badge variant="outline" className="text-[10px] h-4 px-1 uppercase tracking-wider">
                        Host
                      </Badge>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {user.status === "ready" ? "Ready to code" : "Browsing..."}
                  </p>
                </div>
              </div>
              <div className={`h-2 w-2 rounded-full ${user.status === "ready" ? "bg-green-500" : "bg-yellow-500"}`} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
