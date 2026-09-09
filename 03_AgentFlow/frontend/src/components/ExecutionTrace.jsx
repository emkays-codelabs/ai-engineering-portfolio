/**
 * Renders an AgentResult's step-by-step execution trace.
 *
 * Author: Mahesh Kumar
 * Founder & CEO, SaffronyxAI.in
 * Copyright: © 2026 SaffronyxAI.in. All Rights Reserved.
 *
 * Original work created by Mahesh Kumar for SaffronyxAI.in.
 */

// Renders an AgentResult's `steps` array as a monospace execution trace.
// Used both in the landing page's static demo and the live console.
export default function ExecutionTrace({ steps = [] }) {
  if (steps.length === 0) {
    return <p className="execution-trace__empty">No execution trace yet.</p>;
  }
  return (
    <ol className="execution-trace">
      {steps.map((step, index) => (
        <li key={index}>{step}</li>
      ))}
    </ol>
  );
}
