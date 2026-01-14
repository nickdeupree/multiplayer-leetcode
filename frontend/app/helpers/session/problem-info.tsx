import { problems } from "@/app/problem-data/problems";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";

export async function getDescriptionById(problemId: string): Promise<string> {
    const response = await fetch(API_BASE_URL + `/problems/getProblemDescription?problemSlug=${problemId}`);
    if (!response.ok) {
        throw new Error("Failed to fetch problem description");
    }
    const data = await response.text();
    return data;
}

export async function getTemplateById(problemId: string): Promise<string> {
    const response = await fetch(API_BASE_URL + `/problems/getProblemTemplate?problemSlug=${problemId}`);
    console.log("Fetching template for", problemId, "response:", response);
    if (!response.ok) {
        throw new Error("Failed to fetch problem template");
    }
    const data = await response.text();
    return data;
}

export function getExamplesById(problemId: string): { input: string; output: string }[] {
    const problem = problems.find(p => p.id === problemId);
    return problem?.examples || [];
}