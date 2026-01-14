"use client";

import React, { useEffect } from "react";
import { useTheme } from "next-themes";
import {Editor, useMonaco } from "@monaco-editor/react";
import { parseTmTheme } from "monaco-themes";

export default function EditorPane() {
  const { resolvedTheme } = useTheme();

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
    <div className="h-full rounded-xl border bg-card p-4">
      <h3 className="font-semibold text-sm">Editor</h3>
      <div className="mt-4 h-full">
        <Editor
          height="100%"
          defaultLanguage="python"
          defaultValue=""
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
