"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import {Editor, useMonaco } from "@monaco-editor/react";
import { parseTmTheme } from "monaco-themes";
import { Button } from "@/components/ui/button";

export default function EditorPane({ initialCode, onRun }: { initialCode?: string | null; onRun?: () => void }) {
  const { resolvedTheme } = useTheme();
  const [value, setValue] = useState<string>(initialCode ?? "");

  useEffect(() => {
    setValue(initialCode ?? "");
  }, [initialCode]);

  const monaco = useMonaco();
  monaco?.editor.defineTheme('my-dark', {
        base: 'vs-dark',
        inherit: true,
        rules: [],
        colors: {
          "editor.background": '#0f172b',
        }
      });

  useEffect(() => {
    if (!resolvedTheme) return;

    const setupTheme = async () => {
      if (!monaco) return;
      if (resolvedTheme === "dark") {
      monaco.editor.setTheme('my-dark');
      } else {
        monaco.editor.setTheme("vs-light");
      }
    };

    setupTheme();
  }, [resolvedTheme]);

  const theme = resolvedTheme === "light" ? "vs-light" : "my-dark";

  return (
    <div className="h-full rounded-xl border bg-card">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="text-lg font-semibold">Code Editor</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onRun}>
            Run
          </Button>
          <Button variant="default" size="sm">
            Submit
          </Button>
        </div>
      </div>
      <div className="p-4 h-[calc(100%-4rem)]">
        <Editor
          height="100%"
          defaultLanguage="python"
          value={value}
          onChange={(v) => setValue(v ?? "")}
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
