import type {
  HeartChamber,
  LeadName,
  RegionLeadInspection,
  RegionLeadRelationship,
  SimulationState
} from "./types";

function contractionDelayMs(chamber: HeartChamber): number {
  return chamber === "RA" || chamber === "LA" ? 55 : 42;
}

function deflectionForVoltage(voltage: number): RegionLeadInspection["leadIndicators"][number]["expectedDeflection"] {
  if (voltage > 0.04) return "positive";
  if (voltage < -0.04) return "negative";
  return "near-flat";
}

function indicator(
  state: SimulationState,
  lead: LeadName,
  relationship: RegionLeadRelationship
): RegionLeadInspection["leadIndicators"][number] {
  return {
    lead,
    relationship,
    voltage: state.leadVoltages[lead],
    expectedDeflection: deflectionForVoltage(state.leadVoltages[lead])
  };
}

export function explainSurfaceRegion(state: SimulationState, regionId: string): RegionLeadInspection | undefined {
  const region = state.surfaceRegions.find((item) => item.id === regionId);
  if (!region) return undefined;

  const contractionOnsetMs = region.activationTimeMs + contractionDelayMs(region.chamber);
  const leadIndicators = [
    ...region.bestSeenLeads.map((lead) => indicator(state, lead, "best-seen")),
    ...region.oppositeLeads.map((lead) => indicator(state, lead, "opposite"))
  ];
  const bestLeadPhrase = region.bestSeenLeads.join(", ");
  const oppositeLeadPhrase = region.oppositeLeads.join(", ");
  const activationDeltaMs = state.timeMs - region.activationTimeMs;
  const repolarizationDeltaMs = state.timeMs - region.repolarizationTimeMs;

  return {
    regionId: region.id,
    label: region.label,
    chamber: region.chamber,
    anatomicalRegion: region.anatomicalRegion,
    state: region.state,
    activationTimeMs: region.activationTimeMs,
    repolarizationTimeMs: region.repolarizationTimeMs,
    contractionOnsetMs,
    activationDeltaMs,
    repolarizationDeltaMs,
    bestSeenLeads: region.bestSeenLeads,
    oppositeLeads: region.oppositeLeads,
    leadIndicators,
    summary: `${region.label} activates at ${Math.round(region.activationTimeMs)} ms and is best reflected by ${bestLeadPhrase}; ${oppositeLeadPhrase} usually sees the opposite side of this region's signal.`
  };
}
