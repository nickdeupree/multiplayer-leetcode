"use client";

import SessionHeader from "@/app/components/headers/session-header";
import QuestionPane from "@/app/components/session/question-pane";
import EditorPane from "@/app/components/session/editor-pane";
import TestRunner from "@/app/components/session/test-runner";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";

export default function SessionPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <SessionHeader />

      <main className="flex-1 w-full px-4 py-8">
        <div className="h-[calc(100vh-8rem)] min-h-0">
          <ResizablePanelGroup className="h-full gap-2" direction="horizontal">
            {/* Left: Question (resizable horizontally) */}
            <ResizablePanel defaultSize={33} className="min-h-0">
              <div className="h-full overflow-y-default">
                <QuestionPane />
              </div>
            </ResizablePanel>

            <ResizableHandle withHandle={false} className="mx-2" />

            {/* Right: Editor and Test Runner (vertical split, resize together) */}
            <ResizablePanel defaultSize={67} className="min-h-0">
              <div className="h-full flex flex-col gap-2 min-h-0">
                <ResizablePanelGroup direction="vertical" className="h-full">
                  <ResizablePanel defaultSize={66} className="min-h-0">
                    <div className="h-full min-h-0">
                      <EditorPane />
                    </div>
                  </ResizablePanel>

                  <ResizableHandle withHandle={false} className="my-2" />

                  <ResizablePanel defaultSize={34} className="min-h-0">
                    <div className="h-full min-h-0 overflow-y-auto">
                      <TestRunner />
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
