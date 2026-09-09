/**
 * Understand/Select/Execute/Observe/Synthesize pipeline section.
 *
 * Author: Mahesh Kumar
 * Founder & CEO, SaffronyxAI.in
 * Copyright: © 2026 SaffronyxAI.in. All Rights Reserved.
 *
 * Original work created by Mahesh Kumar for SaffronyxAI.in.
 */

const STEPS = [
  { id: "01", title: "Understand", description: "Analyze the user's request." },
  { id: "02", title: "Select", description: "Determine the most appropriate architecture." },
  { id: "03", title: "Execute", description: "Run the selected agent and required tools." },
  { id: "04", title: "Observe", description: "Capture tool outputs and intermediate results." },
  { id: "05", title: "Synthesize", description: "Produce the final response." },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="section">
      <h2>From question to answer — automatically.</h2>
      <ol className="how-it-works">
        {STEPS.map((step) => (
          <li key={step.id}>
            <span className="how-it-works__step">{step.id}</span>
            <h3>{step.title}</h3>
            <p>{step.description}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
