/**
 * Single architecture summary card.
 *
 * Author: Mahesh Kumar
 * Founder & CEO, SaffronyxAI.in
 * Copyright: © 2026 SaffronyxAI.in. All Rights Reserved.
 *
 * Original work created by Mahesh Kumar for SaffronyxAI.in.
 */

export default function ArchitectureCard({ architecture }) {
  const { name, subtitle, flow, bestFor, advantage, limitation } = architecture;
  return (
    <article className="architecture-card">
      <h3>{name}</h3>
      <p className="architecture-card__subtitle">{subtitle}</p>
      <pre className="architecture-card__flow">{flow}</pre>
      <p>
        <strong>Best for:</strong> {bestFor}
      </p>
      <p>
        <strong>Advantage:</strong> {advantage}
      </p>
      <p>
        <strong>Limitation:</strong> {limitation}
      </p>
    </article>
  );
}
