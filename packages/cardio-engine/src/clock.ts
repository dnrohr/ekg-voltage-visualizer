import type { CardiacScenario } from "./types";

export type PlaybackSpeed = 0.05 | 0.1 | 0.25 | 0.5 | 1 | 2;

export type CardiacClockState = {
  timeMs: number;
  normalizedTime: number;
  cycleMs: number;
};

export const playbackSpeeds: PlaybackSpeed[] = [0.05, 0.1, 0.25, 0.5, 1, 2];

export const frameStepMs = 16;
export const millisecondStepMs = 1;

export function normalizeCycleMs(timeMs: number, cycleMs: number): number {
  if (!Number.isFinite(timeMs) || !Number.isFinite(cycleMs) || cycleMs <= 0) {
    return 0;
  }

  return ((timeMs % cycleMs) + cycleMs) % cycleMs;
}

export function cycleMsToNormalized(timeMs: number, cycleMs: number): number {
  if (!Number.isFinite(cycleMs) || cycleMs <= 0) {
    return 0;
  }

  return normalizeCycleMs(timeMs, cycleMs) / cycleMs;
}

export function normalizedToCycleMs(normalizedTime: number, cycleMs: number): number {
  if (!Number.isFinite(normalizedTime) || !Number.isFinite(cycleMs) || cycleMs <= 0) {
    return 0;
  }

  return normalizeCycleMs(normalizedTime * cycleMs, cycleMs);
}

export function createClockState(scenario: CardiacScenario, timeMs: number): CardiacClockState {
  const cycleMs = scenario.timing.cycleMs;
  const normalizedTime = cycleMsToNormalized(timeMs, cycleMs);

  return {
    timeMs: normalizedTime * cycleMs,
    normalizedTime,
    cycleMs
  };
}

export function advanceClock(
  scenario: CardiacScenario,
  currentTimeMs: number,
  elapsedRealMs: number,
  speed: PlaybackSpeed
): CardiacClockState {
  const elapsedCardiacMs = Number.isFinite(elapsedRealMs) ? elapsedRealMs * speed : 0;
  return createClockState(scenario, currentTimeMs + elapsedCardiacMs);
}

export function stepClock(
  scenario: CardiacScenario,
  currentTimeMs: number,
  stepMs: number
): CardiacClockState {
  return createClockState(scenario, currentTimeMs + stepMs);
}
