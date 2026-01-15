"use client";

import { useSearchParams } from "next/navigation";
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

export default function SessionPage() {
  const searchParams = useSearchParams();
  const problemId = searchParams.get('problemId');

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
  
  // Ref to store collab handle for syncing execution state
  const collabRef = useRef<CollabHandle | null>(null);
  const isUpdatingFromRemote = useRef(false);

  const handleRun = async () => {
    if (!problemId || !currentCode) return;
    
    // Update local state
    setIsRunning(true);
    setShowResults(true);
    setSubmitResult(null);
    
    // Sync state via Yjs to all users
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
      
      // Sync results via Yjs to all users
      collabRef.current?.setExecutionResults({
        runResult: result,
      });
    } catch (error) {
      console.error("Failed to run code:", error);
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
    
    // Update local state
    setIsSubmitting(true);
    setShowResults(true);
    setRunResult(null);
    
    // Sync state via Yjs to all users
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
      
      // Sync results via Yjs to all users
      collabRef.current?.setExecutionResults({
        submitResult: result,
      });
    } catch (error) {
      console.error("Failed to submit code:", error);
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
        console.log("Fetched problem data", { desc, tmpl });
        if (!mounted) return;
        setDescription(desc);
        setTemplate(tmpl);
        setCurrentCode(tmpl);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error("Failed to fetch problem data", e);
        if (mounted) {
          setDescription(null);
          setTemplate(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, [problemId]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <SessionHeader />

      <main className="flex-1 w-full px-4 py-8">
        <div className="h-[calc(100vh-8rem)] min-h-0">
          <ResizablePanelGroup className="h-full gap-2" direction="horizontal">
            {/* Left: Question (resizable horizontally) */}
            <ResizablePanel defaultSize={33} className="min-h-0">
              <div className="h-full overflow-y-default">
                <QuestionPane problemId={problemId} description={description} loading={loading} />
              </div>
            </ResizablePanel> 

            <ResizableHandle withHandle={false} className="mx-2" />

            {/* Right: Editor and Test Runner (vertical split, resize together) */}
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
                        roomName={problemId ?? 'monaco'}
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

                  <ResizableHandle withHandle={false} className="my-2" />

                  <ResizablePanel defaultSize={34} className="min-h-0">
                    <div className="h-full min-h-0 overflow-y-auto">
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
