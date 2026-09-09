/**
 * Final call-to-action section.
 *
 * Author: Mahesh Kumar
 * Founder & CEO, SaffronyxAI.in
 * Copyright: © 2026 SaffronyxAI.in. All Rights Reserved.
 *
 * Original work created by Mahesh Kumar for SaffronyxAI.in.
 */

import { Link } from "react-router-dom";

export default function CTASection() {
  return (
    <section className="section cta-section">
      <h2>Build smarter agent workflows.</h2>
      <p>
        Explore how different agent architectures solve the same problem —
        and discover when each one should be used.
      </p>
      <div className="hero__actions">
        <Link to="/console" className="button button--primary">
          Launch AgentFlow →
        </Link>
        <a
          href="https://github.com"
          className="button button--secondary"
          target="_blank"
          rel="noreferrer"
        >
          View on GitHub →
        </a>
      </div>
    </section>
  );
}
