/**
 * Grid of all five architecture cards.
 *
 * Author: Mahesh Kumar
 * Founder & CEO, SaffronyxAI.in
 * Copyright: © 2026 SaffronyxAI.in. All Rights Reserved.
 *
 * Original work created by Mahesh Kumar for SaffronyxAI.in.
 */

import { ARCHITECTURES } from "../data/architectures";
import ArchitectureCard from "./ArchitectureCard";

export default function ArchitectureComparison() {
  return (
    <section id="architectures" className="section">
      <h2>One platform. Five ways to reason.</h2>
      <p className="section__subtitle">
        Different tasks require different execution strategies. AgentFlow
        implements five core agent architectures and makes their trade-offs
        visible.
      </p>
      <div className="architecture-grid">
        {ARCHITECTURES.map((architecture) => (
          <ArchitectureCard key={architecture.id} architecture={architecture} />
        ))}
      </div>
    </section>
  );
}
