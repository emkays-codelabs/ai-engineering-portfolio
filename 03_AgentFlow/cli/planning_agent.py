"""Standalone CLI entry point for the Planning agent.

Author: Mahesh Kumar
Founder & CEO, SaffronyxAI.in
Copyright: © 2026 SaffronyxAI.in. All Rights Reserved.

Original work created by Mahesh Kumar for SaffronyxAI.in.
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from backend.app.agents import planner

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print('Usage: python cli/planning_agent.py "question"')
        raise SystemExit(1)
    try:
        result = planner.run(" ".join(sys.argv[1:]))
        print("\n".join(result["steps"]))
        print(f"\nFinal Answer:\n{result['answer']}")
    except Exception as exc:
        print(f"Error: {exc}")
        raise SystemExit(1)
