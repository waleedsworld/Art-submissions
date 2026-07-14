import * as React from "react";
import {
  assignVariant,
  trackConversion,
  trackEvent,
  trackExposure,
  type Experiment,
  type Variant,
} from "@/lib/ab-testing";

export interface UseExperimentResult {
  /** The variant this visitor is assigned to. */
  variant: Variant;
  /** Convenience check: `isVariant("showcase")`. */
  isVariant: (id: Variant) => boolean;
  /** Record a conversion/goal for this experiment + variant. */
  convert: (props?: Record<string, unknown>) => void;
  /** Record an arbitrary event tied to this experiment + variant. */
  track: (type: string, props?: Record<string, unknown>) => void;
}

/**
 * React binding for the A/B harness. Resolves the visitor's variant once,
 * fires a (de-duplicated) exposure event on mount, and returns helpers for
 * recording conversions — no external state library required.
 */
export function useExperiment(experiment: Experiment): UseExperimentResult {
  // Assignment is deterministic + persisted, so computing it once per mount
  // is stable across renders for this visitor.
  const variant = React.useMemo(
    () => assignVariant(experiment),
    [experiment]
  );

  React.useEffect(() => {
    trackExposure(experiment, variant);
  }, [experiment, variant]);

  return React.useMemo(
    () => ({
      variant,
      isVariant: (id: Variant) => id === variant,
      convert: (props?: Record<string, unknown>) =>
        trackConversion(experiment.key, variant, props),
      track: (type: string, props?: Record<string, unknown>) =>
        trackEvent(type, experiment.key, variant, props),
    }),
    [experiment, variant]
  );
}
