import type {
  HeartChamber,
  LeadName,
  RegionLeadInspection,
  RegionLeadRelationship,
  SimulationState
} from "./types";
import { classifyRegionLeadContribution } from "./probe";

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

function tissueStateExplanation(region: SimulationState["surfaceRegions"][number]): string {
  switch (region.state) {
    case "depolarizing":
      return "The depolarization wavefront is crossing this region now, so it is a strong changing source for nearby lead measurements.";
    case "active":
      return "This tissue is already depolarized and refractory. It can still shape the field, but the moving wavefront has passed.";
    case "repolarizing":
      return "This region is electrically recovering. Repolarization changes source direction and helps shape the teaching T wave.";
    case "recovered":
      return "This region has recovered electrically and is ready for the next cycle, so it contributes little changing signal right now.";
    default:
      return "This region has not activated yet in the current cycle, so it is mostly a future contributor.";
  }
}

function timingPhrase(deltaMs: number, eventName: string): string {
  if (deltaMs >= 0) return `${eventName} was ${Math.round(deltaMs)} ms ago`;
  return `${eventName} is expected in ${Math.abs(Math.round(deltaMs))} ms`;
}

function selectedLeadRelationshipSummary(
  state: SimulationState,
  region: SimulationState["surfaceRegions"][number],
  lead: LeadName
) {
  const contribution = classifyRegionLeadContribution(region, lead);
  const voltage = state.leadVoltages[lead];
  const voltagePhrase = voltage > 0.04 ? "positive" : voltage < -0.04 ? "negative" : "near baseline";

  if (contribution.relationship === "best-seen") {
    return `${lead} is one of the leads that best sees this region. When the region is active, its simplified source tends to support this lead's ${voltagePhrase} deflection.`;
  }

  if (contribution.relationship === "opposite") {
    return `${lead} views this region from the opposite side in the teaching model. Activity here tends to oppose this lead's positive direction.`;
  }

  return `${lead} is an indirect view of this region. Activity here can still matter, but other regions usually explain more of this lead's current shape.`;
}

export function explainSurfaceRegion(state: SimulationState, regionId: string, selectedLead?: LeadName): RegionLeadInspection | undefined {
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
  const selectedLeadContribution = selectedLead ? classifyRegionLeadContribution(region, selectedLead) : undefined;

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
    selectedLead,
    selectedLeadRelationship: selectedLeadContribution?.relationship,
    selectedLeadContributionClass: selectedLeadContribution?.classification,
    tissueStateExplanation: tissueStateExplanation(region),
    wavefrontTimingSummary: `${timingPhrase(activationDeltaMs, "Activation")}; ${timingPhrase(repolarizationDeltaMs, "recovery")}.`,
    leadRelationshipSummary: selectedLead ? selectedLeadRelationshipSummary(state, region, selectedLead) : undefined,
    safetyNote: "Educational model only: use this to reason about timing and polarity, not to localize disease or interpret a patient ECG.",
    summary: `${region.label} activates at ${Math.round(region.activationTimeMs)} ms and is best reflected by ${bestLeadPhrase}; ${oppositeLeadPhrase} usually sees the opposite side of this region's signal.`
  };
}
