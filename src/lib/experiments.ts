import type { Experiment } from "./ab-testing";

/**
 * Central registry of active experiments. Add new experiments here and read
 * them anywhere via `useExperiment(EXPERIMENTS.someKey.key)`.
 *
 * Keeping the config in one typed object means every call site references a
 * real experiment (typos become type errors) and disabling a test is a
 * one-line `enabled: false`.
 */
export const EXPERIMENTS = {
  /**
   * Tests whether a more action-oriented primary CTA on the landing hero
   * drives more submission starts than the neutral default.
   */
  heroCta: {
    key: "hero_cta_copy",
    description: "Landing hero primary call-to-action wording",
    variants: [
      { id: "control" }, // "Submit Your Artwork"
      { id: "showcase" }, // "Showcase Your Art"
    ],
  } satisfies Experiment,
} as const;

export type ExperimentKey = keyof typeof EXPERIMENTS;
