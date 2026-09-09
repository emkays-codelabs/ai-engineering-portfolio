/**
 * AgentFlow interactive console: query, mode selector, live trace.
 *
 * Author: Mahesh Kumar
 * Founder & CEO, SaffronyxAI.in
 * Copyright: © 2026 SaffronyxAI.in. All Rights Reserved.
 *
 * Original work created by Mahesh Kumar for SaffronyxAI.in.
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { useAgent } from "../hooks/useAgent";
import ExecutionTrace from "../components/ExecutionTrace";
import { ARCHITECTURES } from "../data/architectures";

const MODES = ["auto", ...ARCHITECTURES.map((a) => a.id)];

export default function ConsolePage() {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState("auto");
  const { run, result, error, loading } = useAgent();

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!query.trim()) return;
    run(query, mode);
  };

  return (
    <div className="console-page">
      <header className="console-page__header">
        <Link to="/" className="navbar__brand">
          AgentFlow
        </Link>
        <span className="console-page__status">● Online</span>
      </header>

      <form onSubmit={handleSubmit} className="console-page__form">
        <textarea
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Ask anything…"
          rows={3}
        />
        <div className="console-page__mode">
          <span className="label">Execution Mode</span>
          {MODES.map((m) => (
            <label key={m}>
              <input
                type="radio"
                name="mode"
                value={m}
                checked={mode === m}
                onChange={() => setMode(m)}
              />
              {m === "auto" ? "Auto" : m}
            </label>
          ))}
        </div>
        <button type="submit" className="button button--primary" disabled={loading}>
          {loading ? "Running…" : "Run Agent →"}
        </button>
      </form>

      {error && <p className="error">{error}</p>}

      {result && (
        <section className="console-page__result">
          <p className="console-page__architecture">
            Architecture selected: <strong>{result.architecture}</strong>
            {result.route ? ` (${result.route})` : ""}
          </p>
          <h3>Execution</h3>
          <ExecutionTrace steps={result.steps} />
          <h3>Answer</h3>
          <p>{result.answer}</p>
          <p className="console-page__metrics">
            {result.llm_calls} LLM Calls · {result.tool_calls} Tool Calls ·{" "}
            {result.latency_ms}ms · ${result.estimated_cost_usd} (est.)
          </p>
        </section>
      )}
    </div>
  );
}
