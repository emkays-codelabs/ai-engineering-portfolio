/**
 * React hook wrapping a single AgentFlow run.
 *
 * Author: Mahesh Kumar
 * Founder & CEO, SaffronyxAI.in
 * Copyright: © 2026 SaffronyxAI.in. All Rights Reserved.
 *
 * Original work created by Mahesh Kumar for SaffronyxAI.in.
 */

import { useState, useCallback } from "react";
import { runAgent } from "../services/api";

// Wraps a single AgentFlow run (query + mode) with loading/error/result state
// so ConsolePage doesn't have to manage fetch lifecycle itself.
export function useAgent() {
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const run = useCallback(async (query, mode = "auto") => {
    setLoading(true);
    setError(null);
    try {
      const data = await runAgent(query, mode);
      setResult(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { run, result, error, loading };
}
