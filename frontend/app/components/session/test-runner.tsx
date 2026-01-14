"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getExamplesById } from "@/app/helpers/session/problem-info";

interface TestCase {
  input: string;
  output: string;
}

export default function TestRunner({ problemId, showResults }: { problemId: string | null; showResults: boolean }) {
  const [examples, setExamples] = useState<TestCase[]>([]);

  useEffect(() => {
    if (problemId) {
      const ex = getExamplesById(problemId);
      setExamples(ex);
    } else {
      setExamples([]);
    }
  }, [problemId]);

  return (
    <div className="h-full rounded-xl border bg-card">
      <Tabs defaultValue="test-cases" className="h-full flex flex-col">
        <TabsList className="grid w-full grid-cols-2 mx-4 mt-4">
          <TabsTrigger value="test-cases">Test Cases</TabsTrigger>
          {showResults && <TabsTrigger value="results">Results</TabsTrigger>}
        </TabsList>
        <div className="flex-1 p-4">
          <TabsContent value="test-cases" className="h-full mt-0">
            {examples.length > 0 ? (
              <Tabs defaultValue="case-0" className="h-full flex flex-col">
                <TabsList className="flex flex-wrap mb-4">
                  {examples.map((_, index) => (
                    <TabsTrigger key={index} value={`case-${index}`} className="flex-1 min-w-0">
                      Case {index + 1}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {examples.map((example, index) => (
                  <TabsContent key={index} value={`case-${index}`} className="flex-1 mt-0">
                    <Card className="h-full">
                      <CardHeader>
                        <CardTitle>Test Case {index + 1}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4 h-[calc(100%-5rem)] overflow-y-auto">
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
              <div className="space-y-4">
                {/* Placeholder for results */}
                <p>Results will be displayed here after running the code.</p>
              </div>
            </TabsContent>
          )}
        </div>
      </Tabs>
    </div>
  );
}
