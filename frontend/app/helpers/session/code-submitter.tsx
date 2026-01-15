const BASE_API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";

export interface TestCase {
  testName: string;
  input: string;
  expectedOutput: string | null;
  actualOutput: string | null;
  passed: boolean;
  errorMessage: string | null;
}

export interface TestSubmitResult {
  status: "all_passed" | "some_failed" | "all_failed" | "error" | "timeout";
  testCases: TestCase[];
  totalCount: number;
  passedCount: number;
  failedCount: number;
  errorMessage: string | null;
  executionTimeMs: number;
}

export async function handleSubmitCode(
  problemSlug: string, 
  code: string
): Promise<TestSubmitResult> {
  try {
    const response = await fetch(`${BASE_API_URL}/code/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        problemSlug,
        code,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        status: "error",
        testCases: [],
        totalCount: 0,
        passedCount: 0,
        failedCount: 0,
        errorMessage: errorData.errorMessage || `Server error: ${response.status}`,
        executionTimeMs: 0,
      };
    }

    const result: TestSubmitResult = await response.json();
    return result;
  } catch (error) {
    return {
      status: "error",
      testCases: [],
      totalCount: 0,
      passedCount: 0,
      failedCount: 0,
      errorMessage: error instanceof Error ? error.message : "Unknown error occurred",
      executionTimeMs: 0,
    };
  }
}
