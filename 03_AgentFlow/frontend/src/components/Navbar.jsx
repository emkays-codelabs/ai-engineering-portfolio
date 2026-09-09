/**
 * Site navigation bar.
 *
 * Author: Mahesh Kumar
 * Founder & CEO, SaffronyxAI.in
 * Copyright: © 2026 SaffronyxAI.in. All Rights Reserved.
 *
 * Original work created by Mahesh Kumar for SaffronyxAI.in.
 */

import { useState } from "react";
import { Link } from "react-router-dom";

// Below the mobile breakpoint (see index.css), the three anchor links collapse
// behind this toggle instead of overflowing the viewport — "Launch Console"
// stays visible at every width since it's the primary CTA.
export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="navbar">
      <Link to="/" className="navbar__brand" onClick={() => setOpen(false)}>
        AgentFlow
      </Link>

      <button
        type="button"
        className="navbar__toggle"
        aria-label="Toggle navigation menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <span />
        <span />
        <span />
      </button>

      <div className={`navbar__links${open ? " navbar__links--open" : ""}`}>
        <a href="#architectures" onClick={() => setOpen(false)}>
          Architectures
        </a>
        <a href="#evaluation" onClick={() => setOpen(false)}>
          Evaluation
        </a>
        <a href="#how-it-works" onClick={() => setOpen(false)}>
          How It Works
        </a>
        <Link to="/console" className="navbar__cta navbar__cta--mobile" onClick={() => setOpen(false)}>
          Launch Console →
        </Link>
      </div>

      <Link to="/console" className="navbar__cta navbar__cta--desktop">
        Launch Console →
      </Link>
    </nav>
  );
}
