"use client";

import Header from "./header";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Play, LogOut } from "lucide-react";

type SelectedProblem = { title?: string; difficulty?: string };

export default function LobbyHeader({
  selectedProblem,
  onStart,
  canStart = false,
  isHost = false
}: {
  selectedProblem?: SelectedProblem | null;
  onStart?: () => void;
  canStart?: boolean;
  isHost?: boolean;
}) {
  const right = (
    <div className="flex items-center gap-3">
      <Link href="/">
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-destructive transition-colors"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Leave
        </Button>
      </Link>
      {isHost && (
        <Button size="sm" className="px-6 font-semibold" disabled={!canStart} onClick={onStart}>
          <Play className="h-4 w-4 mr-2 fill-current" />
          Start Session
        </Button>
      )}
      {!isHost && selectedProblem && (
        <div className="flex items-center gap-2 text-sm text-yellow-500 animate-pulse">
          Waiting for host...
        </div>
      )}
    </div>
  );

  return (
    <Header
      variant="lobby"
      subtitle={<span className="text-muted-foreground font-medium text-base">Session Lobby</span>}
      right={right}
    />
  );
}
