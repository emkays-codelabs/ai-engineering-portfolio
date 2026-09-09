/**
 * Live benchmark dashboard calling POST /api/benchmark.
 *
 * Author: Mahesh Kumar
 * Founder & CEO, SaffronyxAI.in
 * Copyright: © 2026 SaffronyxAI.in. All Rights Reserved.
 *
 * Original work created by Mahesh Kumar for SaffronyxAI.in.
 */

import { useState } from "react";
import { runBenchmark } from "../services/api";

// Displays real metrics from POST /api/benchmark. Accuracy is intentionally
// never fabricated — the backend reports "Not yet measured" until a labeled
// test set exists, and this component shows that string as-is.
export default function EvaluationDashboard() {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = () => {
    setLoading(true);
    setError(null);
    runBenchmark()
      .then(setSummary)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  // Benchmark hits a live LLM 12 times — only run it when the visitor asks,
  // never automatically on mount.
  return (
    <section id="evaluation" className="section">
      <h2>Compare. Measure. Optimize.</h2>
      <p className="section__subtitle">
        Agent architecture affects more than answer quality — it changes
        latency, cost, and tool usage too.
      </p>
      <button className="button button--secondary" onClick={load} disabled={loading}>
        {loading ? "Running benchmark…" : "Run benchmark"}
      </button>
      {error && <p className="error">{error}</p>}
      {summary && (
        <table className="evaluation-table">
          <thead>
            <tr>
              <th>Architecture</th>
              <th>Avg Latency (ms)</th>
              <th>Avg LLM Calls</th>
              <th>Avg Tool Calls</th>
              <th>Avg Cost (USD, est.)</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(summary.aggregate_by_architecture).map(([name, stats]) => (
              <tr key={name}>
                <td>{name}</td>
                <td>{stats.avg_latency_ms}</td>
                <td>{stats.avg_llm_calls}</td>
                <td>{stats.avg_tool_calls}</td>
                <td>{stats.avg_cost_usd}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <p className="evaluation-note">Accuracy: {summary ? summary.accuracy : "Not yet measured"}</p>
    </section>
  );
}
