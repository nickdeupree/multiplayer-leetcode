import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";

export interface LobbyUser {
  id: string | number;
  name: string;
  isHost: boolean;
  isReady: boolean;
  color?: string;
}

interface UserListProps {
  users: LobbyUser[];
  currentUserId?: string | number;
  onEditName?: () => void;
}

export function UserList({ users, currentUserId, onEditName }: UserListProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          Players
          <Badge variant="secondary" className="ml-2">
            {users.length} / 4
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {users.map((user) => (
            <div key={user.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar
                  className="h-9 w-9 border-2"
                  style={{ borderColor: user.color || 'transparent' }}
                >
                  <AvatarImage src={`https://avatar.vercel.sh/${user.name || 'user'}.png`} />
                  <AvatarFallback>{user.name?.[0]?.toUpperCase() || '?'}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium leading-none flex items-center gap-2">
                    {user.name || "Anonymous"}
                    {user.isHost && (
                      <Badge variant="outline" className="text-[10px] h-4 px-1 uppercase tracking-wider">
                        Host
                      </Badge>
                    )}
                    {currentUserId === user.id && onEditName && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 ml-1 hover:bg-transparent hover:text-primary p-0"
                        onClick={onEditName}
                        title="Edit Name"
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {user.isReady ? "Ready to code" : "Waiting..."}
                  </p>
                </div>
              </div>
              <div
                className={`h-2 w-2 rounded-full transition-colors duration-300 ${user.isReady ? "bg-green-500 shadow-[0_0_8px_0_rgb(34,197,94)]" : "bg-yellow-500"}`}
              />
            </div>
          ))}
          {users.length === 0 && (
            <p className="text-sm text-muted-foreground italic">Waiting for players...</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
