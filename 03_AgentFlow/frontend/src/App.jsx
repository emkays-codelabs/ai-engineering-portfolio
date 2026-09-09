/**
 * AgentFlow root component: routes between the landing page and the console.
 *
 * Author: Mahesh Kumar
 * Founder & CEO, SaffronyxAI.in
 * Copyright: © 2026 SaffronyxAI.in. All Rights Reserved.
 *
 * Original work created by Mahesh Kumar for SaffronyxAI.in.
 */

import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import ConsolePage from "./pages/ConsolePage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/console" element={<ConsolePage />} />
    </Routes>
  );
}
