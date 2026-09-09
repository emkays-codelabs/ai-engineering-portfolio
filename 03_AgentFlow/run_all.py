"""Runs the AgentFlow benchmark suite from the command line.

Author: Mahesh Kumar
Founder & CEO, SaffronyxAI.in
Copyright: (c) 2026 SaffronyxAI.in. All Rights Reserved.

Original work created by Mahesh Kumar for SaffronyxAI.in.
"""

import json
from pathlib import Path

from backend.app.evaluation.benchmark import run_benchmark


def main():
    summary = run_benchmark()

    for entry in summary["results"]:
        result = entry["result"]
        print(f"\n{'='*80}\nTest {entry['id']}: {entry['prompt']}\nArchitecture: {result['architecture']}")
        print(f"Tool(s): {', '.join(result['tools_used']) or 'None'}\nAnswer: {result['answer']}")

    for entry in summary["errors"]:
        print(f"\n{'='*80}\nTest {entry['id']}: {entry['prompt']}\nERROR: {entry['error']}")

    print("\n" + "=" * 80)
    print("Aggregate by architecture:")
    print(json.dumps(summary["aggregate_by_architecture"], indent=2))
    print(f"Accuracy: {summary['accuracy']}")

    Path("test_results.json").write_text(json.dumps(summary, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"\nSaved full results to test_results.json")


if __name__ == "__main__":
    main()
