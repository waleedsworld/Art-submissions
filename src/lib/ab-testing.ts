/**
 * Lightweight, dependency-free A/B testing harness.
 *
 * Design goals:
 *  - Deterministic assignment: a given visitor always lands in the same
 *    variant for a given experiment (stable across reloads and sessions).
 *  - Zero network + zero external deps: everything runs client-side and
 *    persists in localStorage. Events are pushed to a pluggable sink so a
 *    real analytics backend can be wired in later without touching call sites.
 *  - SSR / non-browser safe: all storage access is guarded.
 */

export type Variant = string;

export interface Experiment {
  /** Stable, unique key used for assignment and reporting. */
  key: string;
  /** Human-readable description (docs / debugging only). */
  description?: string;
  /**
   * Candidate variants with relative weights. Weights need not sum to 1;
   * they are normalized. The first entry is treated as the control.
   */
  variants: Array<{ id: Variant; weight?: number }>;
  /** If false, everyone gets the control and no exposure is logged. */
  enabled?: boolean;
}

export interface ABEvent {
  type: "exposure" | "conversion" | string;
  experiment: string;
  variant: Variant;
  /** Optional free-form metadata (e.g. { goal: "submit_click" }). */
  props?: Record<string, unknown>;
  visitorId: string;
  timestamp: number;
}

export type ABEventSink = (event: ABEvent) => void;

const VISITOR_KEY = "ab.visitor";
const ASSIGN_PREFIX = "ab.assign.";
const EXPOSURE_PREFIX = "ab.exposed.";

const isBrowser = typeof window !== "undefined" && typeof window.localStorage !== "undefined";

/** Safe localStorage reader — never throws in private mode / SSR. */
function readStore(key: string): string | null {
  if (!isBrowser) return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

/** Safe localStorage writer — swallows quota / access errors. */
function writeStore(key: string, value: string): void {
  if (!isBrowser) return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* storage unavailable — assignment stays in-memory for this page load */
  }
}

/**
 * FNV-1a 32-bit string hash. Fast, deterministic and well-distributed —
 * enough to bucket visitors without pulling in a crypto dependency.
 */
export function hashString(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    // hash *= 16777619, kept in 32-bit space
    hash = Math.imul(hash, 0x01000193);
  }
  // Coerce to unsigned 32-bit integer.
  return hash >>> 0;
}

/** A stable per-browser id, generated once and reused. */
export function getVisitorId(): string {
  const existing = readStore(VISITOR_KEY);
  if (existing) return existing;
  const generated =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `v-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  writeStore(VISITOR_KEY, generated);
  return generated;
}

/**
 * Deterministically pick a variant for an experiment.
 *
 * The visitor id + experiment key are hashed into the unit interval and
 * mapped onto the weighted variant ranges, so the choice is stable and
 * reproducible for the same visitor without any stored state. A prior
 * explicit assignment (see {@link assignVariant}) always wins so results
 * stay consistent even if the config weights are later tweaked.
 */
export function pickVariant(experiment: Experiment, visitorId: string): Variant {
  const control = experiment.variants[0]?.id ?? "control";
  if (experiment.enabled === false || experiment.variants.length === 0) {
    return control;
  }

  const total = experiment.variants.reduce(
    (sum, v) => sum + Math.max(0, v.weight ?? 1),
    0
  );
  if (total <= 0) return control;

  // Map hash to [0, 1). Divide by 2^32.
  const bucket = hashString(`${visitorId}:${experiment.key}`) / 0x100000000;
  let cursor = 0;
  for (const variant of experiment.variants) {
    cursor += Math.max(0, variant.weight ?? 1) / total;
    if (bucket < cursor) return variant.id;
  }
  return experiment.variants[experiment.variants.length - 1].id;
}

/**
 * Resolve (and persist) the variant a visitor is assigned to. The first
 * resolved value is cached so subsequent calls — and future config edits —
 * do not reshuffle an active visitor.
 */
export function assignVariant(experiment: Experiment, visitorId = getVisitorId()): Variant {
  const cacheKey = `${ASSIGN_PREFIX}${experiment.key}`;
  const cached = readStore(cacheKey);
  if (cached) {
    // Honour cache only if it is still a declared variant.
    if (experiment.variants.some((v) => v.id === cached)) return cached;
  }
  const chosen = pickVariant(experiment, visitorId);
  writeStore(cacheKey, chosen);
  return chosen;
}

const sinks = new Set<ABEventSink>();

/**
 * Register an event sink (e.g. forward to your analytics provider). Returns
 * an unsubscribe function. In dev a console sink is attached by default.
 */
export function addEventSink(sink: ABEventSink): () => void {
  sinks.add(sink);
  return () => sinks.delete(sink);
}

// Default dev-only sink: surfaces events in the console without any backend.
if (isBrowser && import.meta.env?.DEV) {
  addEventSink((event) => {
    console.debug("[ab]", event.type, event.experiment, "→", event.variant, event.props ?? "");
  });
}

// Optionally bridge into a global analytics queue when one exists.
if (isBrowser) {
  addEventSink((event) => {
    const w = window as unknown as { dataLayer?: unknown[] };
    if (Array.isArray(w.dataLayer)) {
      w.dataLayer.push({ event: `ab_${event.type}`, ...event });
    }
  });
}

function emit(event: ABEvent): void {
  sinks.forEach((sink) => {
    try {
      sink(event);
    } catch {
      /* a broken sink must never break the app */
    }
  });
}

/**
 * Record an exposure for an experiment. De-duplicated per visitor + variant
 * so repeated renders do not inflate exposure counts.
 */
export function trackExposure(experiment: Experiment, variant: Variant): void {
  if (experiment.enabled === false) return;
  const visitorId = getVisitorId();
  const dedupeKey = `${EXPOSURE_PREFIX}${experiment.key}:${variant}`;
  if (readStore(dedupeKey)) return;
  writeStore(dedupeKey, String(Date.now()));
  emit({
    type: "exposure",
    experiment: experiment.key,
    variant,
    visitorId,
    timestamp: Date.now(),
  });
}

/** Record a conversion / goal event against an experiment. */
export function trackConversion(
  experimentKey: string,
  variant: Variant,
  props?: Record<string, unknown>
): void {
  emit({
    type: "conversion",
    experiment: experimentKey,
    variant,
    props,
    visitorId: getVisitorId(),
    timestamp: Date.now(),
  });
}

/** Escape hatch for arbitrary tracked events tied to an experiment. */
export function trackEvent(
  type: string,
  experimentKey: string,
  variant: Variant,
  props?: Record<string, unknown>
): void {
  emit({
    type,
    experiment: experimentKey,
    variant,
    props,
    visitorId: getVisitorId(),
    timestamp: Date.now(),
  });
}
