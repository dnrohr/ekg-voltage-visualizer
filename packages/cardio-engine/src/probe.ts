import { leadDefinitions } from "./leads";
import type {
  LeadName,
  LeadContributionClass,
  LeadProbeAlignment,
  LeadProbeExplanation,
  RegionProbeContribution,
  HeartSurfaceRegionState,
  SimulationState,
  TissueState
} from "./types";
import { dot, magnitude } from "./vector";

function activeWeight(state: TissueState, activationProgress: number, repolarizationProgress: number): number {
  if (state === "depolarizing") return Math.max(0.35, activationProgress);
  if (state === "repolarizing") return Math.max(0.25, repolarizationProgress * 0.75);
  if (state === "active") return 0.18;
  return 0;
}

function relationshipWeight(
  region: Pick<HeartSurfaceRegionState, "bestSeenLeads" | "oppositeLeads">,
  lead: LeadName
): RegionProbeContribution["relationship"] {
  if (region.bestSeenLeads.includes(lead)) return "best-seen";
  if (region.oppositeLeads.includes(lead)) return "opposite";
  return "indirect";
}

export function classifyRegionLeadContribution(
  region: Pick<
    HeartSurfaceRegionState,
    "bestSeenLeads" | "oppositeLeads" | "state" | "activationProgress" | "repolarizationProgress"
  >,
  lead: LeadName
): Pick<RegionProbeContribution, "relationship" | "classification" | "signedWeight"> {
  const relationship = relationshipWeight(region, lead);
  const activity = activeWeight(region.state, region.activationProgress, region.repolarizationProgress);
  const relationshipSign = relationship === "opposite" ? -1 : relationship === "best-seen" ? 1 : 0.35;
  const signedWeight = relationshipSign * activity;
  const classification: LeadContributionClass =
    activity <= 0.05 ? "weak" : relationship === "best-seen" ? "aligned" : relationship === "opposite" ? "opposed" : "weak";

  return {
    relationship,
    classification,
    signedWeight
  };
}

function classifyAlignment(
  projection: number,
  normalizedProjection: number,
  markerVoltage: number,
  regionContributions: RegionProbeContribution[]
): LeadProbeAlignment {
  const positiveRegions = regionContributions.some((region) => region.signedWeight > 0.12);
  const negativeRegions = regionContributions.some((region) => region.signedWeight < -0.12);

  if (positiveRegions && negativeRegions && Math.abs(markerVoltage) < 0.18) return "mixed";
  if (Math.abs(normalizedProjection) < 0.16 || Math.abs(markerVoltage) < 0.04) return "sideways";
  return projection > 0 ? "toward" : "away";
}

function alignmentLabel(alignment: LeadProbeAlignment): string {
  switch (alignment) {
    case "toward":
      return "Vector points toward this lead's positive pole";
    case "away":
      return "Vector points away from this lead's positive pole";
    case "mixed":
      return "Opposing regional contributions partly cancel";
    default:
      return "Vector is nearly sideways to this lead";
  }
}

export function explainLeadProbe(state: SimulationState, lead: LeadName): LeadProbeExplanation {
  const definition = leadDefinitions[lead];
  const projection = dot(state.netVector, definition.axis);
  const vectorMagnitude = Math.max(0.0001, magnitude(state.netVector));
  const normalizedProjection = projection / vectorMagnitude;
  const markerVoltage = state.leadVoltages[lead];
  const regions = state.surfaceRegions
    .map((region) => {
      const contribution = classifyRegionLeadContribution(region, lead);

      return {
        regionId: region.id,
        label: region.label,
        chamber: region.chamber,
        state: region.state,
        relationship: contribution.relationship,
        classification: contribution.classification,
        signedWeight: contribution.signedWeight,
        activationTimeMs: region.activationTimeMs,
        repolarizationTimeMs: region.repolarizationTimeMs,
        activationProgress: region.activationProgress,
        repolarizationProgress: region.repolarizationProgress
      };
    })
    .filter((region) => Math.abs(region.signedWeight) > 0.05)
    .sort((a, b) => Math.abs(b.signedWeight) - Math.abs(a.signedWeight))
    .slice(0, 5);
  const alignment = classifyAlignment(projection, normalizedProjection, markerVoltage, regions);
  const directionPhrase =
    alignment === "toward"
      ? "rises because the dominant vector is aimed toward its positive side"
      : alignment === "away"
        ? "falls because the dominant vector is aimed away from its positive side"
        : alignment === "mixed"
          ? "is shaped by competing regions on opposite sides of this view"
          : "stays small because the dominant vector is nearly perpendicular to this view";

  return {
    lead,
    projection,
    normalizedProjection,
    markerVoltage,
    alignment,
    alignmentLabel: alignmentLabel(alignment),
    regions,
    summary: `${lead} ${directionPhrase}. At ${Math.round(state.timeMs)} ms, its projection marker is ${markerVoltage.toFixed(2)} mV.`
  };
}
