/**
 * Site navigation bar.
 *
 * Author: Mahesh Kumar
 * Founder & CEO, SaffronyxAI.in
 * Copyright: © 2026 SaffronyxAI.in. All Rights Reserved.
 *
 * Original work created by Mahesh Kumar for SaffronyxAI.in.
 */

import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="navbar">
      <Link to="/" className="navbar__brand">
        AgentFlow
      </Link>
      <div className="navbar__links">
        <a href="#architectures">Architectures</a>
        <a href="#evaluation">Evaluation</a>
        <a href="#how-it-works">How It Works</a>
      </div>
      <Link to="/console" className="navbar__cta">
        Launch Console →
      </Link>
    </nav>
  );
}
