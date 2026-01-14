"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Search } from "lucide-react";

export interface Problem {
  id: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  topics: string[];
  tags: string[];
  examples: { input: string; output: string;}[];
}

interface ProblemTableProps {
  problems: Problem[];
  onSelectProblem?: (problem: Problem) => void;
  selectedProblemId?: string;
}

export function ProblemTable({ problems, onSelectProblem, selectedProblemId }: ProblemTableProps) {
  const [search, setSearch] = useState("");

  const filteredProblems = problems.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.topics.some(t => t.toLowerCase().includes(search.toLowerCase())) ||
    p.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
  );

  const getDifficultyColor = (difficulty: Problem["difficulty"]) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-100 text-green-700 dark:bg-green-700/20 dark:text-green-400 border-green-200 dark:border-green-700/50";
      case "Medium":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-700/20 dark:text-yellow-400 border-yellow-200 dark:border-yellow-700/50";
      case "Hard":
        return "bg-red-100 text-red-700 dark:bg-red-700/20 dark:text-red-400 border-red-200 dark:border-red-700/50";
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search problems, topics, or tags..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>
      <div className="rounded-md border bg-card h-screen overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Problem Name</TableHead>
              <TableHead>Difficulty</TableHead>
              <TableHead>Topics</TableHead>
              <TableHead>Tags</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProblems.map((problem) => (
              <TableRow
                key={problem.id}
                className={`cursor-pointer transition-colors ${
                  selectedProblemId === problem.id ? "bg-muted" : "hover:bg-muted/50"
                }`}
                onClick={() => onSelectProblem?.(problem)}
              >
                <TableCell className="font-medium">{problem.title}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={getDifficultyColor(problem.difficulty)}>
                    {problem.difficulty}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {problem.topics.map((topic) => (
                      <Badge key={topic} variant="secondary" className="text-[10px] px-1.5 py-0">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {problem.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-[10px] px-1.5 py-0">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredProblems.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  No problems found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
