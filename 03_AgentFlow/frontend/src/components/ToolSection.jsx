/**
 * Tool ecosystem section (calculator, search, registry).
 *
 * Author: Mahesh Kumar
 * Founder & CEO, SaffronyxAI.in
 * Copyright: © 2026 SaffronyxAI.in. All Rights Reserved.
 *
 * Original work created by Mahesh Kumar for SaffronyxAI.in.
 */

const TOOLS = [
  {
    name: "Web Search",
    description: "Powered by Tavily. Retrieve current information from the web.",
    example: 'search("latest AI agent frameworks")',
  },
  {
    name: "Calculator",
    description: "Local deterministic arithmetic, evaluated via a Python AST whitelist.",
    example: 'calculator("25 * 48") → 1200',
  },
  {
    name: "Tool Registry",
    description: "Add new capabilities without changing the core orchestration layer.",
    example: null,
  },
];

export default function ToolSection() {
  return (
    <section className="section">
      <h2>Give agents the capabilities they need.</h2>
      <div className="tool-grid">
        {TOOLS.map((tool) => (
          <article key={tool.name} className="tool-card">
            <h3>{tool.name}</h3>
            <p>{tool.description}</p>
            {tool.example && <pre>{tool.example}</pre>}
          </article>
        ))}
      </div>
    </section>
  );
}
