/**
 * Static backend architecture diagram.
 *
 * Author: Mahesh Kumar
 * Founder & CEO, SaffronyxAI.in
 * Copyright: © 2026 SaffronyxAI.in. All Rights Reserved.
 *
 * Original work created by Mahesh Kumar for SaffronyxAI.in.
 */

// Static ASCII-style diagram of the backend layers. Mirrors the real module
// layout under backend/app/ so it stays honest as the code changes.
export default function ArchitectureDiagram() {
  return (
    <pre className="architecture-diagram">
{`                  FRONTEND
                     │
                     ▼
                FASTAPI API
                     │
                     ▼
             AGENT ORCHESTRATOR
                     │
       ┌─────────────┼─────────────┐
       ▼             ▼             ▼
    Simple        Router          Planner
       │             │             │
       └─────────────┼─────────────┘
                     ▼
              TOOL REGISTRY
                │         │
                ▼         ▼
           Calculator   Search
                     │
                     ▼
                  EURI LLM`}
    </pre>
  );
}
