"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import SessionHeader from "@/app/components/headers/session-header";
import QuestionPane from "@/app/components/session/question-pane";
import EditorPane from "@/app/components/session/editor-pane";
import TestRunner from "@/app/components/session/test-runner";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { getDescriptionById, getTemplateById } from "@/app/helpers/session/problem-info";
import { handleRunCode, CodeRunResult } from "@/app/helpers/session/code-runner";
import { handleSubmitCode, TestSubmitResult } from "@/app/helpers/session/code-submitter";
import type { CollabHandle } from "@/app/helpers/session/collab";
import { useYjsLobby } from "@/hooks/use-yjs-lobby";
import { Loader2 } from "lucide-react";

export default function SessionPage() {
    const params = useParams();
    const lobbyId = params.lobbyId as string;

    // Read-only access to lobby state to get the problem ID
    const { selectedProblem } = useYjsLobby(lobbyId, false);
    const problemId = selectedProblem?.id;

    const [localUser, setLocalUser] = useState<{ name: string; color: string } | null>(null);

    useEffect(() => {
        try {
            const saved = localStorage.getItem('multiplayer-leetcode-user');
            if (saved) {
                setLocalUser(JSON.parse(saved));
            }
        } catch (e) {
            console.error("Failed to load user info", e);
        }
    }, [lobbyId]);

    const userColor = localUser?.color;
    const userName = localUser?.name;

    const [description, setDescription] = useState<string | null>(null);
    const [template, setTemplate] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [currentCode, setCurrentCode] = useState<string>("");
    const [runResult, setRunResult] = useState<CodeRunResult | null>(null);
    const [submitResult, setSubmitResult] = useState<TestSubmitResult | null>(null);
    const [isRunning, setIsRunning] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedTestCase, setSelectedTestCase] = useState(0);

    const collabRef = useRef<CollabHandle | null>(null);
    const isUpdatingFromRemote = useRef(false);

    // Fetch problem data when problemId is available
    useEffect(() => {
        if (!problemId) {
            setDescription(null);
            setTemplate(null);
            return;
        }

        let mounted = true;
        const fetchData = async () => {
            setLoading(true);
            try {
                const desc = await getDescriptionById(problemId);
                const tmpl = await getTemplateById(problemId);

                if (!mounted) return;
                setDescription(desc);
                setTemplate(tmpl);

                // Only set current code if it's empty (first load)
                // If we rejoin, Yjs will handle it, but for initial local state:
                setCurrentCode(tmpl);
            } catch (e) {
                console.error("Failed to fetch problem data", e);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        fetchData();

        return () => {
            mounted = false;
        };
    }, [problemId]);

    const handleRun = async () => {
        if (!problemId || !currentCode) return;

        setIsRunning(true);
        setShowResults(true);
        setSubmitResult(null);

        collabRef.current?.setExecutionState({
            isRunning: true,
            showResults: true,
        });
        collabRef.current?.setExecutionResults({
            submitResult: null,
        });

        try {
            const result = await handleRunCode(problemId, currentCode, selectedTestCase);
            setRunResult(result);

            collabRef.current?.setExecutionResults({
                runResult: result,
            });
        } catch (error) {
            const errorResult: CodeRunResult = {
                status: "error" as const,
                actualOutput: null,
                expectedOutput: null,
                errorMessage: "Failed to execute code",
                executionTimeMs: 0,
            };
            setRunResult(errorResult);
            collabRef.current?.setExecutionResults({
                runResult: errorResult,
            });
        } finally {
            setIsRunning(false);
            collabRef.current?.setExecutionState({
                isRunning: false,
            });
        }
    };

    const handleSubmit = async () => {
        if (!problemId || !currentCode) return;

        setIsSubmitting(true);
        setShowResults(true);
        setRunResult(null);

        collabRef.current?.setExecutionState({
            isSubmitting: true,
            showResults: true,
        });
        collabRef.current?.setExecutionResults({
            runResult: null,
        });

        try {
            const result = await handleSubmitCode(problemId, currentCode);
            setSubmitResult(result);

            collabRef.current?.setExecutionResults({
                submitResult: result,
            });
        } catch (error) {
            const errorResult: TestSubmitResult = {
                status: "error" as const,
                testCases: [],
                totalCount: 0,
                passedCount: 0,
                failedCount: 0,
                errorMessage: "Failed to submit code",
                executionTimeMs: 0,
            };
            setSubmitResult(errorResult);
            collabRef.current?.setExecutionResults({
                submitResult: errorResult,
            });
        } finally {
            setIsSubmitting(false);
            collabRef.current?.setExecutionState({
                isSubmitting: false,
            });
        }
    };

    if (!problemId || loading && !template) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background flex-col gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Syncing session data...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            <SessionHeader />

            <main className="flex-1 w-full px-4 py-8">
                <div className="h-[calc(100vh-8rem)] min-h-0">
                    <ResizablePanelGroup className="h-full gap-2" direction="horizontal">
                        {/* Left: Question */}
                        <ResizablePanel defaultSize={33} className="min-h-0">
                            <div className="h-full overflow-y-auto custom-scrollbar">
                                <QuestionPane problemId={problemId} description={description} loading={loading} />
                            </div>
                        </ResizablePanel>

                        <ResizableHandle withHandle={false} className="mx-2 bg-border w-[2px] rounded-full transition-colors hover:bg-primary/50" />

                        {/* Right: Editor and Test Runner */}
                        <ResizablePanel defaultSize={67} className="min-h-0">
                            <div className="h-full flex flex-col gap-2 min-h-0">
                                <ResizablePanelGroup direction="vertical" className="h-full">
                                    <ResizablePanel defaultSize={66} className="min-h-0">
                                        <div className="h-full min-h-0">
                                            <EditorPane
                                                initialCode={template}
                                                onRun={handleRun}
                                                onSubmit={handleSubmit}
                                                onCodeChange={setCurrentCode}
                                                isRunning={isRunning}
                                                isSubmitting={isSubmitting}
                                                roomName={`lobby-${lobbyId}`} /* Using the same room as lobby for consistency */
                                                userColor={userColor}
                                                userName={userName}
                                                onCollabReady={(handle: CollabHandle) => {
                                                    collabRef.current = handle;
                                                }}
                                                onExecutionStateChange={(state: any) => {
                                                    isUpdatingFromRemote.current = true;
                                                    setIsRunning(state.isRunning);
                                                    setIsSubmitting(state.isSubmitting);
                                                    setShowResults(state.showResults);
                                                    setSelectedTestCase(state.selectedTestCase);
                                                    setTimeout(() => {
                                                        isUpdatingFromRemote.current = false;
                                                    }, 0);
                                                }}
                                                onResultsChange={(results: any) => {
                                                    isUpdatingFromRemote.current = true;
                                                    setRunResult(results.runResult);
                                                    setSubmitResult(results.submitResult);
                                                    setTimeout(() => {
                                                        isUpdatingFromRemote.current = false;
                                                    }, 0);
                                                }}
                                            />
                                        </div>
                                    </ResizablePanel>

                                    <ResizableHandle withHandle={false} className="my-2 bg-border h-[2px] rounded-full transition-colors hover:bg-primary/50" />

                                    <ResizablePanel defaultSize={34} className="min-h-0">
                                        <div className="h-full min-h-0 overflow-y-auto custom-scrollbar">
                                            <TestRunner
                                                problemId={problemId}
                                                showResults={showResults}
                                                runResult={runResult}
                                                submitResult={submitResult}
                                                onTestCaseSelect={setSelectedTestCase}
                                                isRunning={isRunning}
                                                isSubmitting={isSubmitting}
                                            />
                                        </div>
                                    </ResizablePanel>
                                </ResizablePanelGroup>
                            </div>
                        </ResizablePanel>
                    </ResizablePanelGroup>
                </div>
            </main>
        </div>
    );
}
