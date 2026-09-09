/**
 * Video walkthrough placeholder and demo scenario list.
 *
 * Author: Mahesh Kumar
 * Founder & CEO, SaffronyxAI.in
 * Copyright: © 2026 SaffronyxAI.in. All Rights Reserved.
 *
 * Original work created by Mahesh Kumar for SaffronyxAI.in.
 */

const SCENARIOS = [
  { id: "01", title: "Simple question", architecture: "Simple" },
  { id: "02", title: "Current information", architecture: "Tool / Router" },
  { id: "03", title: "Complex research task", architecture: "Planner / ReAct" },
];

// videoUrl is intentionally optional — the walkthrough video doesn't exist
// yet, so this renders the scenario list without a broken embed until one
// is supplied via this prop.
export default function DemoSection({ videoUrl = null }) {
  return (
    <section className="section">
      <h2>See AgentFlow in action.</h2>
      {videoUrl ? (
        <div className="demo-video">
          <iframe
            src={videoUrl}
            title="AgentFlow walkthrough"
            allowFullScreen
          />
        </div>
      ) : (
        <p className="demo-video__placeholder">Walkthrough video coming soon.</p>
      )}
      <ol className="demo-scenarios">
        {SCENARIOS.map((scenario) => (
          <li key={scenario.id}>
            <span>{scenario.id}</span>
            <h3>{scenario.title}</h3>
            <p>{scenario.architecture}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
