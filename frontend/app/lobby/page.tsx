"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserList, User } from "@/app/components/lobby/user-list";
import { InviteCode } from "@/app/components/lobby/invite-code";
import { ProblemTable, Problem } from "@/app/components/lobby/problem-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Users2, BookOpen } from "lucide-react";
import LobbyHeader from "@/app/components/headers/lobby-header";
import Link from "next/link";

import { MOCK_USERS, MOCK_PROBLEMS } from "@/app/mock_data/lobby";

export default function LobbyPage() {
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Lobby Header */}
      <LobbyHeader selectedProblem={selectedProblem} onStart={() => router.push('/session')} />

      <main className="flex-1 w-full px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-8rem)]">
          {/* Left Column: Users and Info */}
          <div className="lg:col-span-4 space-y-6 overflow-y-auto pr-2 pb-4">
            <div className="space-y-6">
              <div className="flex flex-col gap-6">
                <InviteCode code="XYZ-123-ABC" />
                <UserList users={MOCK_USERS} />
              </div>
              
              <div className="p-4 rounded-xl border bg-muted/30 space-y-3">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                  Quick Tips
                </h3>
                <ul className="text-xs text-muted-foreground space-y-2 list-disc pl-4">
                  <li>Pick a problem that matches your group's level.</li>
                  <li>Click on a problem in the table to select it.</li>
                  <li>Only the host can start the session.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Right Column: Problem Selection */}
          <div className="lg:col-span-8 flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Users2 className="h-6 w-6 text-primary" />
                  Select a Problem
                </h2>
                <p className="text-sm text-muted-foreground">
                  Browse and select which challenge to tackle as a team.
                </p>
              </div>
              {selectedProblem && (
                <div className="flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20 animate-in fade-in slide-in-from-right-2">
                  <span className="text-xs font-semibold text-primary">Selected:</span>
                  <span className="text-xs font-bold">{selectedProblem.title}</span>
                  <Badge variant="outline" className="text-[10px] h-4 py-0 px-1 ml-1 bg-background">
                    {selectedProblem.difficulty}
                  </Badge>
                </div>
              )}
            </div>

            <div className="flex-1 min-h-0">
              <ProblemTable 
                problems={MOCK_PROBLEMS} 
                onSelectProblem={setSelectedProblem}
                selectedProblemId={selectedProblem?.id}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
