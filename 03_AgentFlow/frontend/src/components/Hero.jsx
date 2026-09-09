/**
 * Landing page hero section.
 *
 * Author: Mahesh Kumar
 * Founder & CEO, SaffronyxAI.in
 * Copyright: © 2026 SaffronyxAI.in. All Rights Reserved.
 *
 * Original work created by Mahesh Kumar for SaffronyxAI.in.
 */

import { Link } from "react-router-dom";

export default function Hero() {
  return (
    <header className="hero">
      <p className="hero__eyebrow">AI AGENT ORCHESTRATION PLATFORM</p>
      <h1 className="hero__title">The right agent architecture for every task.</h1>
      <p className="hero__subtitle">
        AgentFlow automatically selects and executes the right agent strategy —
        from direct LLM responses to tool use, routing, ReAct, and multi-step
        planning.
      </p>
      <div className="hero__actions">
        <Link to="/console" className="button button--primary">
          Launch AgentFlow →
        </Link>
        <a href="#architectures" className="button button--secondary">
          Explore Architectures
        </a>
      </div>
    </header>
  );
}
