/**
 * AgentFlow marketing/landing page.
 *
 * Author: Mahesh Kumar
 * Founder & CEO, SaffronyxAI.in
 * Copyright: © 2026 SaffronyxAI.in. All Rights Reserved.
 *
 * Original work created by Mahesh Kumar for SaffronyxAI.in.
 */

import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import ConsolePreview from "../components/ConsolePreview";
import ArchitectureComparison from "../components/ArchitectureComparison";
import HowItWorks from "../components/HowItWorks";
import ToolSection from "../components/ToolSection";
import ExecutionTrace from "../components/ExecutionTrace";
import EvaluationDashboard from "../components/EvaluationDashboard";
import ArchitectureDiagram from "../components/ArchitectureDiagram";
import DemoSection from "../components/DemoSection";
import CTASection from "../components/CTASection";
import Footer from "../components/Footer";

const SAMPLE_TRACE = [
  "Generated plan with 3 steps",
  "Step 1 [search]: Research candidate frameworks -> ...",
  "Step 2 [llm]: Compare capabilities -> ...",
  "Synthesized final answer",
];

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <ConsolePreview />
        <ArchitectureComparison />
        <HowItWorks />
        <ToolSection />
        <section className="section">
          <h2>Don't just get the answer. See how it was solved.</h2>
          <ExecutionTrace steps={SAMPLE_TRACE} />
        </section>
        <EvaluationDashboard />
        <section className="section">
          <h2>Built as an extensible agent platform.</h2>
          <ArchitectureDiagram />
        </section>
        <DemoSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
