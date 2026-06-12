# A/B testing harness

A tiny, dependency-free experimentation layer for the app. It handles
deterministic variant assignment and event tracking entirely client-side,
with no network calls and no third-party SDK.

## Files

- `src/lib/ab-testing.ts` — core: visitor id, hashing, assignment, event sinks.
- `src/lib/experiments.ts` — the typed registry of active experiments.
- `src/hooks/use-experiment.ts` — React hook (`useExperiment`).

## How assignment works

Each browser gets a stable `visitorId` (stored in `localStorage`). For an
experiment, `visitorId + experiment.key` is hashed (FNV-1a) into `[0, 1)` and
mapped onto the variants' weight ranges. Because it is a pure hash, the same
visitor always resolves to the same variant — no server and no flicker. The
first resolved variant is also cached so later weight tweaks don't reshuffle
an active visitor.

## Adding an experiment

Add an entry to `EXPERIMENTS` in `src/lib/experiments.ts`:

```ts
export const EXPERIMENTS = {
  heroCta: {
    key: "hero_cta_copy",
    variants: [{ id: "control" }, { id: "showcase" }],
  } satisfies Experiment,
} as const;
```

`variants[0]` is the control. Weights are optional (default `1`) and get
normalized, so `[{ id: "a", weight: 3 }, { id: "b", weight: 1 }]` is a 75/25
split. Set `enabled: false` to force everyone to control.

## Using it in a component

```tsx
const heroCta = useExperiment(EXPERIMENTS.heroCta);

<Button
  onClick={() => {
    heroCta.convert({ goal: "submit_cta_click" });
    open();
  }}
>
  {heroCta.isVariant("showcase") ? "Showcase Your Art" : "Submit Your Artwork"}
</Button>
```

An exposure event fires once (de-duplicated per visitor + variant) when the
component mounts; `convert()` records the goal.

## Wiring events to a backend

By default events are logged to the console in dev and pushed to
`window.dataLayer` when present. To forward them anywhere else, register a
sink at app startup:

```ts
import { addEventSink } from "@/lib/ab-testing";

addEventSink((event) => {
  fetch("/api/ab", { method: "POST", body: JSON.stringify(event) });
});
```

`addEventSink` returns an unsubscribe function. Sink errors are swallowed so a
broken analytics pipeline can never break the app.

## Live experiment

`hero_cta_copy` on the landing page tests the primary CTA wording
("Submit Your Artwork" vs "Showcase Your Art") against submission-start clicks.
