"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import SessionHeader from "@/app/components/headers/session-header";
import QuestionPane from "@/app/components/session/question-pane";
import EditorPane from "@/app/components/session/editor-pane";
import TestRunner from "@/app/components/session/test-runner";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { getDescriptionById, getTemplateById } from "@/app/helpers/session/problem-info";

export default function SessionPage() {
  const searchParams = useSearchParams();
  const problemId = searchParams.get('problemId');

  const [description, setDescription] = useState<string | null>(null);
  const [template, setTemplate] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleRun = () => {
    setShowResults(true);
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
                      <EditorPane initialCode={template} onRun={handleRun} />
                    </div> 
                  </ResizablePanel>

                  <ResizableHandle withHandle={false} className="my-2" />

                  <ResizablePanel defaultSize={34} className="min-h-0">
                    <div className="h-full min-h-0 overflow-y-auto">
                      <TestRunner problemId={problemId} showResults={showResults} />
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
