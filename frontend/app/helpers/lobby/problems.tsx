import { problems as ALL_PROBLEMS } from "@/app/problem-data/problems";
import type { Problem } from "@/app/components/lobby/problem-table";

/**
 * Returns problems formatted for `ProblemTable`
 */
export function getProblemsForTable(): Problem[] {
  return ALL_PROBLEMS.map((p) => ({
    id: p.id,
    title: p.title,
    difficulty: (p.difficulty ?? "Easy") as Problem["difficulty"],
    topics: p.topics,
    tags: p.tags,
    examples: p.examples ?? [],
  }));
}
