"use client";

import React, { useEffect, useState, useRef } from "react";
import { useTheme } from "next-themes";
import { Editor, useMonaco } from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { initCollaboration, CollabHandle, ExecutionState, ExecutionResults } from "@/app/helpers/session/collab";

export default function EditorPane({
  initialCode,
  onRun,
  onSubmit,
  onCodeChange,
  isRunning,
  isSubmitting,
  roomName,
  websocketUrl,
  userName,
  userColor,
  onCollabReady,
  onExecutionStateChange,
  onResultsChange,
}: {
  initialCode?: string | null;
  onRun?: () => void;
  onSubmit?: () => void;
  onCodeChange?: (code: string) => void;
  isRunning?: boolean;
  isSubmitting?: boolean;
  roomName?: string;
  websocketUrl?: string;
  userName?: string;
  userColor?: string;
  onCollabReady?: (handle: CollabHandle) => void;
  onExecutionStateChange?: (state: ExecutionState) => void;
  onResultsChange?: (results: ExecutionResults) => void;
}) {
  const { resolvedTheme } = useTheme();
  // Initialize as empty to defer to Yjs
  const [value, setValue] = useState<string>("");

  // Collab handle ref for provider/binding/cleanup
  const collabRef = useRef<{ cleanup?: () => Promise<void> | void; ydoc?: any; provider?: any; binding?: any } | null>(null);

  // Removed useEffect syncing initialCode to value


  const monaco = useMonaco();

  // Define custom theme
  useEffect(() => {
    if (monaco) {
      monaco.editor.defineTheme('my-dark', {
        base: 'vs-dark',
        inherit: true,
        rules: [],
        colors: {
          "editor.background": '#0f172b',
        }
      });
    }
  }, [monaco]);

  // Handle Theme Switching
  useEffect(() => {
    if (!monaco || !resolvedTheme) return;
    if (resolvedTheme === "dark") {
      monaco.editor.setTheme('my-dark');
    } else {
      monaco.editor.setTheme("vs-light");
    }
  }, [monaco, resolvedTheme]);

  const theme = resolvedTheme === "light" ? "vs-light" : "my-dark";

  const handleEditorMount = async (editor: any, monacoInstance: any) => {
    try {
      const handle = await initCollaboration({
        editor,
        monaco: monacoInstance,
        initialCode,
        roomName,
        websocketUrl,
        userName,
        userColor,
        onCodeChange: (newCode: string) => {
          setValue(newCode);
          if (onCodeChange) onCodeChange(newCode);
        },
        onExecutionStateChange,
        onResultsChange,
      });
      collabRef.current = handle;

      // Notify parent component that collab is ready
      if (onCollabReady) {
        onCollabReady(handle);
      }

      // Sync initial value from shared doc
      try {
        const initial = handle.ydoc?.getText('monaco')?.toString();
        if (initial !== undefined) setValue(initial);
      } catch (e) {
        // ignore
      }

    } catch (e) {
      console.error('Failed to initialize collaborative binding', e);
    }
  };

  // Cleanup
  useEffect(() => {
    return () => {
      try {
        collabRef.current?.cleanup?.();
      } catch (e) {
        console.warn('Error during Yjs cleanup', e);
      }
    };
  }, []);

  // Update awareness when props change
  useEffect(() => {
    if (collabRef.current?.provider?.awareness && (userName || userColor)) {
      const awareness = collabRef.current.provider.awareness;
      const currentState = awareness.getLocalState();

      const newState = {
        ...currentState?.user,
      };

      let changed = false;
      if (userName && userName !== currentState?.user?.name) {
        newState.name = userName;
        changed = true;
      }
      if (userColor && userColor !== currentState?.user?.color) {
        newState.color = userColor;
        changed = true;
      }

      if (changed) {
        awareness.setLocalStateField('user', newState);
      }
    }
  }, [userName, userColor]);

  // Standard Monaco onChange
  const handleChange = (v: string | undefined) => {
    // We only update local state here. 
    // The MonacoBinding handles syncing this change to the Yjs doc automatically.
    setValue(v ?? "");
    if (onCodeChange) {
      onCodeChange(v ?? "");
    }
  };

  return (
    <div className="h-full rounded-xl border bg-card">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="text-lg font-semibold">Code Editor</h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onRun}
            disabled={isRunning || isSubmitting}
          >
            {isRunning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running...
              </>
            ) : "Run"}
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={onSubmit}
            disabled={isRunning || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : "Submit"}
          </Button>
        </div>
      </div>
      <div className="p-4 h-[calc(100%-4rem)]">
        <Editor
          height="100%"
          defaultLanguage="python"
          value={value}
          onChange={handleChange}
          onMount={handleEditorMount}
          theme={theme}
          options={{
            automaticLayout: true,
            minimap: { enabled: false },
          }}
          aria-label="code-editor"
        />
      </div>
    </div>
  );
}