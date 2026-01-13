import type { User } from "@/app/components/lobby/user-list";
import type { Problem } from "@/app/components/lobby/problem-table";

export const MOCK_USERS: User[] = [
  { id: "1", name: "Alice", role: "host", status: "ready" },
  { id: "2", name: "Bob", role: "guest", status: "ready" },
  { id: "3", name: "Charlie", role: "guest", status: "waiting" },
];

export const MOCK_PROBLEMS: Problem[] = [
  {
    id: "1",
    title: "Two Sum",
    difficulty: "Easy",
    topics: ["Array", "Hash Table"],
    tags: ["Top 100", "Interview"],
  },
  {
    id: "2",
    title: "Add Two Numbers",
    difficulty: "Medium",
    topics: ["Linked List", "Math"],
    tags: ["Recursion"],
  },
  {
    id: "3",
    title: "Longest Substring Without Repeating Characters",
    difficulty: "Medium",
    topics: ["Hash Table", "String", "Sliding Window"],
    tags: ["Standard"],
  },
  {
    id: "4",
    title: "Median of Two Sorted Arrays",
    difficulty: "Hard",
    topics: ["Array", "Binary Search", "Divide and Conquer"],
    tags: ["Advanced"],
  },
  {
    id: "5",
    title: "Longest Palindromic Substring",
    difficulty: "Medium",
    topics: ["String", "Dynamic Programming"],
    tags: ["Classic"],
  },
  {
    id: "6",
    title: "ZigZag Conversion",
    difficulty: "Medium",
    topics: ["String"],
    tags: ["Logic"],
  },
  {
    id: "7",
    title: "Reverse Integer",
    difficulty: "Medium",
    topics: ["Math"],
    tags: ["Standard"],
  },
];
