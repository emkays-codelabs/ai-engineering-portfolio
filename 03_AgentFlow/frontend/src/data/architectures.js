/**
 * Static metadata for the five agent architectures.
 *
 * Author: Mahesh Kumar
 * Founder & CEO, SaffronyxAI.in
 * Copyright: © 2026 SaffronyxAI.in. All Rights Reserved.
 *
 * Original work created by Mahesh Kumar for SaffronyxAI.in.
 */

// Static metadata describing the 5 agent architectures, shared by the
// landing page's ArchitectureCard grid and the console's ModeSelector.
export const ARCHITECTURES = [
  {
    id: "simple",
    name: "Simple",
    subtitle: "Direct LLM response",
    flow: "Query → LLM → Answer",
    bestFor: "Straightforward questions and explanations.",
    advantage: "Fast and inexpensive.",
    limitation: "No external tools or explicit workflow control.",
  },
  {
    id: "tool",
    name: "Tool-Using",
    subtitle: "LLM + tools",
    flow: "Query → LLM → Tool → Observation → Answer",
    bestFor: "Tasks requiring external information or deterministic computation.",
    advantage: "Model can dynamically select among multiple tools.",
    limitation: "Tool choice depends on model behavior.",
  },
  {
    id: "router",
    name: "Router",
    subtitle: "Classify → Dispatch",
    flow: "Query → Router → Specialized Path",
    bestFor: "Multi-domain assistants with clearly separable categories.",
    advantage: "Predictable dispatch into specialized workflows.",
    limitation: "A bad classification can send a request down the wrong path.",
  },
  {
    id: "react",
    name: "ReAct",
    subtitle: "Reason → Act → Observe",
    flow: "Reason → Action → Observation → Reason → Answer",
    bestFor: "Dynamic tasks where the next action depends on prior observations.",
    advantage: "Makes iterative tool use explicit and traceable.",
    limitation: "More LLM turns increase latency and cost.",
  },
  {
    id: "planner",
    name: "Planner",
    subtitle: "Plan → Execute → Synthesize",
    flow: "Query → Plan → Execute → Synthesize → Answer",
    bestFor: "Complex, multi-step research or analysis tasks.",
    advantage: "Separates planning from execution and final synthesis.",
    limitation: "Planning adds overhead and can introduce planning errors.",
  },
];
