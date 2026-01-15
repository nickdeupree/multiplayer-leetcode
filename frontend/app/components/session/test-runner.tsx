"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getExamplesById } from "@/app/helpers/session/problem-info";
import { CodeRunResult } from "@/app/helpers/session/code-runner";
import { TestSubmitResult } from "@/app/helpers/session/code-submitter";
import { CheckCircle2, XCircle, Clock, AlertCircle } from "lucide-react";

interface TestCase {
  input: string;
  output: string;
}

export default function TestRunner({
  problemId,
  showResults,
  runResult,
  submitResult,
  onTestCaseSelect,
  isRunning,
  isSubmitting,
}: {
  problemId: string | null;
  showResults: boolean;
  runResult?: CodeRunResult | null;
  submitResult?: TestSubmitResult | null;
  onTestCaseSelect?: (index: number) => void;
  isRunning?: boolean;
  isSubmitting?: boolean;
}) {
  const [examples, setExamples] = useState<TestCase[]>([]);
  const [selectedCaseIndex, setSelectedCaseIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<string>("test-cases");

  useEffect(() => {
    // When results are shown (a run/submit was initiated) or operation is in progress, switch to Results tab
    if (showResults || isRunning || isSubmitting) {
      setActiveTab("results");
    } else {
      setActiveTab("test-cases");
    }
  }, [showResults, isRunning, isSubmitting]);

  useEffect(() => {
    // Helpful debug logging to verify behavior during runtime
    console.debug("TestRunner state:", {
      showResults,
      isRunning,
      isSubmitting,
      activeTab,
    });
  }, [showResults, isRunning, isSubmitting, activeTab]);

  useEffect(() => {
    if (problemId) {
      const ex = getExamplesById(problemId);
      setExamples(ex);
    } else {
      setExamples([]);
    }
  }, [problemId]);

  const handleTestCaseChange = (index: number) => {
    setSelectedCaseIndex(index);
    if (onTestCaseSelect) {
      onTestCaseSelect(index);
    }
  };

  return (
    // 1. Added overflow-hidden to root to strictly contain children
    <div className="h-full rounded-xl border bg-card flex flex-col overflow-hidden">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v)} className="h-full flex flex-col">
        <TabsList className="grid w-full grid-cols-2 mx-4 mt-4 flex-none w-[calc(100%-2rem)]">
          <TabsTrigger value="test-cases">Test Cases</TabsTrigger>
          {showResults && <TabsTrigger value="results">Results</TabsTrigger>}
        </TabsList>
        
        {/* 2. Added min-h-0. This is crucial for nested scrolling in flex containers */}
        <div className="flex-1 p-4 min-h-0">
          <TabsContent value="test-cases" className="h-full mt-0">
            {examples.length > 0 ? (
              <Tabs
                defaultValue="case-0"
                value={`case-${selectedCaseIndex}`}
                onValueChange={(v) =>
                  handleTestCaseChange(parseInt(v.replace("case-", "")))
                }
                className="h-full flex flex-col"
              >
                <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-muted">
                  <TabsList className="flex whitespace-nowrap gap-2 py-1 min-w-max">
                    {examples.map((_, index) => (
                      <TabsTrigger
                        key={index}
                        value={`case-${index}`}
                        className="inline-flex flex-none px-3 py-1 rounded-md"
                      >
                        Case {index + 1}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>
                {examples.map((example, index) => (
                  <TabsContent
                    key={index}
                    value={`case-${index}`}
                    // 3. Ensure TabsContent fills available space
                    className="flex-1 mt-0 min-h-0 h-full"
                  >
                    {/* 4. Card is now a flex column. */}
                    <Card className="h-full flex flex-col overflow-hidden">
                      {/* 5. Content is flex-1 (fills remaining space) and handles the scroll */}
                      <CardContent className="flex-1 overflow-y-auto space-y-4 pt-6">
                        <div>
                          <h4 className="font-semibold mb-2">Input:</h4>
                          <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
                            {example.input}
                          </pre>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">Expected Output:</h4>
                          <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
                            {example.output}
                          </pre>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                ))}
              </Tabs>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                No test cases available
              </div>
            )}
          </TabsContent>

          {showResults && (
            <TabsContent value="results" className="h-full mt-0">
              {/* Show submit results if available */}
              {submitResult ? (
                <div className="h-full flex flex-col overflow-hidden">
                  {/* Summary header */}
                  <div className="flex-none p-4 border-b">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-lg">
                        {submitResult.passedCount}/{submitResult.totalCount} test cases passed
                      </h3>
                      <span className="text-sm text-muted-foreground">
                        {submitResult.executionTimeMs}ms
                      </span>
                    </div>
                    {submitResult.status === "all_passed" && (
                      <Badge className="bg-green-500">All Tests Passed</Badge>
                    )}
                    {submitResult.status === "some_failed" && (
                      <Badge variant="destructive">Some Tests Failed</Badge>
                    )}
                    {submitResult.status === "all_failed" && (
                      <Badge variant="destructive">All Tests Failed</Badge>
                    )}
                    {submitResult.errorMessage && (
                      <div className="mt-2">
                        <p className="text-sm text-red-500">{submitResult.errorMessage}</p>
                      </div>
                    )}
                  </div>

                  {/* Test case tabs */}
                  <div className="flex-1 min-h-0 p-4">
                    {submitResult.testCases.length > 0 ? (
                      <Tabs defaultValue="test-0" className="h-full flex flex-col">
                        <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-muted">
                          <TabsList className="flex whitespace-nowrap gap-2 py-1 min-w-max">
                            {submitResult.testCases.map((testCase, index) => (
                              <TabsTrigger
                                key={index}
                                value={`test-${index}`}
                                className="inline-flex items-center gap-2 px-3 py-1 rounded-md flex-none"
                              >
                                {testCase.passed ? (
                                  <CheckCircle2 className="w-3 h-3 text-green-500" />
                                ) : (
                                  <XCircle className="w-3 h-3 text-red-500" />
                                )}
                                Case {index + 1}
                              </TabsTrigger>
                            ))}
                          </TabsList>
                        </div>
                        {submitResult.testCases.map((testCase, index) => (
                          <TabsContent
                            key={index}
                            value={`test-${index}`}
                            className="flex-1 mt-0 min-h-0 h-full"
                          >
                            <Card className="h-full flex flex-col overflow-hidden">
                              <CardContent className="flex-1 overflow-y-auto space-y-4 pt-6">
                                <div>
                                  <h4 className="font-semibold mb-2">Input:</h4>
                                  <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
                                    {testCase.input}
                                  </pre>
                                </div>
                                {testCase.expectedOutput && (
                                  <div>
                                    <h4 className="font-semibold mb-2">Expected Output:</h4>
                                    <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
                                      {testCase.expectedOutput}
                                    </pre>
                                  </div>
                                )}
                                {testCase.actualOutput && (
                                  <div>
                                    <h4 className="font-semibold mb-2">Your Output:</h4>
                                    <pre className={`p-3 rounded text-sm overflow-x-auto ${
                                      testCase.passed ? 'bg-green-50 dark:bg-green-950' : 'bg-red-50 dark:bg-red-950'
                                    }`}>
                                      {testCase.actualOutput}
                                    </pre>
                                  </div>
                                )}
                                {testCase.errorMessage && (
                                  <div>
                                    <h4 className="font-semibold mb-2 text-red-500">Error:</h4>
                                    <pre className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 p-3 rounded text-sm overflow-x-auto whitespace-pre-wrap">
                                      {testCase.errorMessage}
                                    </pre>
                                  </div>
                                )}
                                {/* {testCase.passed ? (
                                  <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 p-4 rounded">
                                    <p className="text-green-700 dark:text-green-300 font-medium flex items-center gap-2">
                                      <CheckCircle2 className="w-4 h-4" />
                                      Test passed successfully!
                                    </p>
                                  </div>
                                ) : (
                                  <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 p-4 rounded">
                                    <p className="text-red-700 dark:text-red-300 font-medium flex items-center gap-2">
                                      <XCircle className="w-4 h-4" />
                                      Test failed
                                    </p>
                                  </div>
                                )} */}
                              </CardContent>
                            </Card>
                          </TabsContent>
                        ))}
                      </Tabs>
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        No test results available
                      </div>
                    )}
                  </div>
                </div>
              ) : runResult ? (
                // Same logic applied to Results Card
                <Card className="h-full flex flex-col overflow-hidden">
                  <CardContent className="flex-1 overflow-y-auto space-y-4 pt-6">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Execution Time:
                      </span>
                      <span className="font-mono">
                        {runResult.executionTimeMs}ms
                      </span>
                    </div>

                    {runResult.errorMessage && (
                      <div>
                        <h4 className="font-semibold mb-2 text-red-500 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          {runResult.errorType || 'Error'}:
                        </h4>
                        <pre className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 p-3 rounded text-sm overflow-x-auto whitespace-pre-wrap">
                          {runResult.errorMessage}
                        </pre>
                      </div>
                    )}

                    {runResult.traceback && (
                      <div>
                        <h4 className="font-semibold mb-2 text-red-500">
                          Traceback:
                        </h4>
                        <pre className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 p-3 rounded text-sm overflow-x-auto whitespace-pre-wrap font-mono text-xs">
                          {runResult.traceback}
                        </pre>
                      </div>
                    )}

                    {runResult.actualOutput !== null && (
                      <div>
                        <h4 className="font-semibold mb-2">Actual Output:</h4>
                        <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
                          {runResult.actualOutput}
                        </pre>
                      </div>
                    )}

                    {runResult.expectedOutput !== null && (
                      <div>
                        <h4 className="font-semibold mb-2">Expected Output:</h4>
                        <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
                          {runResult.expectedOutput}
                        </pre>
                      </div>
                    )}

                    {runResult.status === "success" && (
                      <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 p-4 rounded">
                        <p className="text-green-700 dark:text-green-300 font-medium">
                          ✓ Test case passed successfully!
                        </p>
                      </div>
                    )}

                    {runResult.status === "failed" && (
                      <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 p-4 rounded">
                        <p className="text-red-700 dark:text-red-300 font-medium">
                          ✗ Test case failed. Output does not match expected
                          result.
                        </p>
                      </div>
                    )}

                    {runResult.status === "timeout" && (
                      <div className="bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 p-4 rounded">
                        <p className="text-orange-700 dark:text-orange-300 font-medium">
                          ⏱ Execution exceeded the 5-second timeout limit.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <p>Run your code to see results</p>
                </div>
              )}
            </TabsContent>
          )}
        </div>
      </Tabs>
    </div>
  );
}