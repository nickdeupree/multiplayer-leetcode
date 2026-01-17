"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useYjsLobby } from "@/hooks/use-yjs-lobby";
import { UserList } from "@/app/components/lobby/user-list";
import { InviteCode } from "@/app/components/lobby/invite-code";
import { ProblemTable, Problem } from "@/app/components/lobby/problem-table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogOverlay } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import LobbyHeader from "@/app/components/headers/lobby-header";
import { getProblemsForTable } from "@/app/helpers/lobby/problems";
import { Users2, BookOpen, Check, Loader2, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function LobbyPage() {
    const params = useParams();
    const router = useRouter();
    const lobbyId = params.lobbyId as string;

    const {
        users,
        currentUser,
        selectedProblem,
        isGameStarted,
        isHost,
        updateName,
        toggleReady,
        selectProblem,
        startGame
    } = useYjsLobby(lobbyId);

    const [nameInput, setNameInput] = useState("");
    const [isNameDialogOpen, setIsNameDialogOpen] = useState(false);

    const problemsForTable = getProblemsForTable();

    // Redirect if game started
    useEffect(() => {
        if (isGameStarted) {
            router.push(`/session/${lobbyId}`);
        }
    }, [isGameStarted, lobbyId, router]);

    // Check for Lobby Full
    if (users.length > 4) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background flex-col gap-4">
                <div className="text-center space-y-2">
                    <h1 className="text-2xl font-bold text-destructive">Lobby Full</h1>
                    <p className="text-muted-foreground">This session has reached its maximum capacity of 4 players.</p>
                    <Button onClick={() => router.push('/')} variant="outline">Back to Home</Button>
                </div>
            </div>
        );
    }

    // Handle Name Dialog
    useEffect(() => {
        // Open dialog if we have a valid currentUser but no name
        if (currentUser && !currentUser.name) {
            setIsNameDialogOpen(true);
        }
    }, [currentUser]);

    useEffect(() => {
        if (isNameDialogOpen && currentUser?.name) {
            setNameInput(currentUser.name);
        }
    }, [isNameDialogOpen, currentUser]);

    const handleNameSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!nameInput.trim()) return;
        updateName(nameInput.trim());
        setIsNameDialogOpen(false);
    };

    const handleStart = () => {
        if (canStart) {
            startGame();
        }
    };

    const areAllReady = users.length > 0 && users.every(u => u.isReady);
    const canStart = Boolean(isHost && selectedProblem && areAllReady);

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            <LobbyHeader
                selectedProblem={selectedProblem}
                onStart={handleStart}
                canStart={canStart}
                isHost={isHost}
            />

            <main className="flex-1 w-full px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-8rem)]">
                    {/* Left Column: Users and Info */}
                    <div className="lg:col-span-4 space-y-6 overflow-y-auto pr-2 pb-4">
                        <div className="space-y-6">
                            <div className="flex flex-col gap-6">
                                <InviteCode code={lobbyId.toUpperCase()} />

                                {currentUser && (
                                    <Card className="p-4 bg-muted/50 border-dashed">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm font-medium">Your Status</p>
                                                </div>
                                                <p className={`text-xs ${currentUser.isReady ? 'text-green-600 font-bold' : 'text-yellow-600'}`}>
                                                    {currentUser.isReady ? "READY" : "NOT READY"}
                                                </p>
                                            </div>
                                            <Button
                                                size="sm"
                                                variant={currentUser.isReady ? "default" : "secondary"}
                                                className={currentUser.isReady ? "bg-green-600 hover:bg-green-700" : ""}
                                                onClick={() => toggleReady()}
                                            >
                                                {currentUser.isReady ? <Check className="mr-2 h-4 w-4" /> : null}
                                                {currentUser.isReady ? "Ready" : "Ready Up"}
                                            </Button>
                                        </div>
                                    </Card>
                                )}

                                <UserList
                                    users={users.map(u => ({ ...u, isHost: users.length > 0 && Math.min(...users.map(x => x.id)) === u.id }))}
                                    currentUserId={currentUser?.id}
                                    onEditName={() => setIsNameDialogOpen(true)}
                                />
                            </div>

                            <div className="p-4 rounded-xl border bg-muted/30 space-y-3">
                                <h3 className="font-semibold text-sm flex items-center gap-2">
                                    <BookOpen className="h-4 w-4 text-primary" />
                                    Quick Tips
                                </h3>
                                <ul className="text-xs text-muted-foreground space-y-2 list-disc pl-4">
                                    <li>Wait for everyone to join before starting.</li>
                                    <li>Click 'Ready Up' when you are prepared.</li>
                                    <li>Host selects the problem.</li>
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
                                    {isHost ? "Browse and select which challenge to tackle." : "Waiting for host to select a challenge."}
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

                        <div className="flex-1 min-h-0 relative">
                            <ProblemTable
                                problems={problemsForTable}
                                onSelectProblem={isHost ? selectProblem : undefined}
                                selectedProblemId={selectedProblem?.id}
                            />
                            {!isHost && (
                                <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] flex items-center justify-center z-10 pointer-events-none">
                                    {/* Optional: Overlay to indicate read-only generally, but pointer-events-none lets them scroll? 
                       Actually pointer-events-none lets them click. 
                       If I want to prevent clicking, I need pointer-events-auto on the overlay.
                       But prompt didn't strictly say guests can't see the table. "Host can choose a problem".
                       So passing undefined to onSelectProblem disabled selection in my ProblemTable logic?
                       Let's check ProblemTable logic.
                       ProblemTable uses `onSelectProblem?.(problem)`. If undefined, it does nothing.
                   */}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* Name Input Dialog */}
            <Dialog open={isNameDialogOpen} onOpenChange={(open) => { if (!currentUser?.name) return; setIsNameDialogOpen(open); }}>
                <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
                    <DialogHeader>
                        <DialogTitle>{currentUser?.name ? "Edit Profile" : "Welcome to the Lobby"}</DialogTitle>
                        <DialogDescription>
                            {currentUser?.name ? "Update your display name." : "Please enter your name to join the session."}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleNameSubmit} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Display Name</Label>
                            <Input
                                id="name"
                                placeholder="e.g. CodingWizard"
                                value={nameInput}
                                onChange={(e) => setNameInput(e.target.value)}
                                className="col-span-3"
                                autoFocus
                            />
                        </div>
                        <DialogFooter>
                            <Button type="submit" disabled={!nameInput.trim()}>
                                {currentUser?.name ? "Save Changes" : "Join Lobby"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
