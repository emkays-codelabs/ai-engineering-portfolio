/**
 * Static console preview shown in the hero.
 *
 * Author: Mahesh Kumar
 * Founder & CEO, SaffronyxAI.in
 * Copyright: © 2026 SaffronyxAI.in. All Rights Reserved.
 *
 * Original work created by Mahesh Kumar for SaffronyxAI.in.
 */

// Static preview of the console UI, shown on the landing page hero.
// The real, interactive version lives at pages/ConsolePage.jsx.
export default function ConsolePreview() {
  return (
    <div className="console-preview">
      <div className="console-preview__header">AGENTFLOW CONSOLE</div>
      <p className="console-preview__query">
        Research the latest AI agent frameworks and recommend one.
      </p>
      <p className="console-preview__architecture">Architecture selected: PLANNER</p>
      <ul className="console-preview__plan">
        <li>✓ Research candidate frameworks</li>
        <li>✓ Compare capabilities</li>
        <li>✓ Generate recommendation</li>
      </ul>
    </div>
  );
}
