const BASE_API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";

export interface CodeRunResult {
  status: "success" | "failed" | "error" | "timeout";
  actualOutput: string | null;
  expectedOutput: string | null;
  errorMessage?: string | null;
  errorType?: string | null;
  traceback?: string | null;
  executionTimeMs: number;
}

export async function handleRunCode(
  problemSlug: string, 
  code: string, 
  testCaseIndex: number
): Promise<CodeRunResult> {
  try {
    const response = await fetch(`${BASE_API_URL}/code/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        problemSlug,
        code,
        testCaseIndex,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        status: "error",
        actualOutput: null,
        expectedOutput: null,
        errorMessage: errorData.errorMessage || `Server error: ${response.status}`,
        executionTimeMs: 0,
      };
    }

    const result: CodeRunResult = await response.json();
    return result;
  } catch (error) {
    return {
      status: "error",
      actualOutput: null,
      expectedOutput: null,
      errorMessage: error instanceof Error ? error.message : "Unknown error occurred",
      executionTimeMs: 0,
    };
  }
}

export async function runCode(code: string, input: string, types: [any, any]): Promise<any> {
  // Legacy function - can be removed or updated later
}