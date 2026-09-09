"""Standalone CLI entry point for the Simple agent.

Author: Mahesh Kumar
Founder & CEO, SaffronyxAI.in
Copyright: © 2026 SaffronyxAI.in. All Rights Reserved.

Original work created by Mahesh Kumar for SaffronyxAI.in.
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from backend.app.agents import simple

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print('Usage: python cli/simple_agent.py "question"')
        raise SystemExit(1)
    try:
        result = simple.run(" ".join(sys.argv[1:]))
        print(result["answer"])
    except Exception as exc:
        print(f"Error: {exc}")
        raise SystemExit(1)
