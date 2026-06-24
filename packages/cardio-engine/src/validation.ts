import { evaluateScenario, generateLeadTrace } from "./simulation";
import type {
  CardiacScenario,
  LeadName,
  ReferenceLeadTrace,
  ReferenceTraceSample,
  ScenarioValidationReport,
  ValidationCheck
} from "./types";

function check(
  id: string,
  label: string,
  level: ValidationCheck["level"],
  status: ValidationCheck["status"],
  detail: string
): ValidationCheck {
  return { id, label, level, status, detail };
}

export function generateSyntheticReferenceTrace(
  scenario: CardiacScenario,
  lead: LeadName
): ReferenceLeadTrace {
  const samples: ReferenceTraceSample[] = generateLeadTrace(scenario, lead, 160).map((sample) => {
    const annotation =
      Math.abs(sample.timeMs - scenario.timing.pPeakMs) < 5
        ? "P"
        : Math.abs(sample.timeMs - scenario.timing.qrsPeakMs) < 5
          ? "QRS"
          : Math.abs(sample.timeMs - scenario.timing.tPeakMs) < 6
            ? "T"
            : undefined;

    return {
      ...sample,
      voltage: sample.voltage * 0.94,
      annotation
    };
  });

  return {
    lead,
    provenance: "synthetic-reference",
    label: `${scenario.name} authored reference envelope`,
    samples
  };
}

export function validateScenario(scenario: CardiacScenario): ScenarioValidationReport {
  const pState = evaluateScenario(scenario, scenario.timing.pPeakMs / scenario.timing.cycleMs);
  const qrsState = evaluateScenario(scenario, scenario.timing.qrsPeakMs / scenario.timing.cycleMs);
  const tState = evaluateScenario(scenario, scenario.timing.tPeakMs / scenario.timing.cycleMs);
  const baseline = evaluateScenario(scenario, 0.02);
  const checks: ValidationCheck[] = [
    check(
      "ordered-events",
      "P-QRS-T event order",
      "conceptual",
      scenario.timing.pPeakMs < scenario.timing.qrsPeakMs && scenario.timing.qrsPeakMs < scenario.timing.tPeakMs ? "pass" : "caution",
      "Electrical event ordering is checked before morphology comparisons."
    ),
    check(
      "lead-ii-qrs",
      "Lead II QRS polarity",
      "polarity-timing",
      qrsState.leadVoltages.II > -0.15 ? "pass" : "caution",
      `Lead II at QRS peak is ${qrsState.leadVoltages.II.toFixed(2)} mV.`
    ),
    check(
      "avr-opposition",
      "aVR opposition",
      "polarity-timing",
      qrsState.leadVoltages.aVR < 0.15 ? "pass" : "caution",
      `aVR at QRS peak is ${qrsState.leadVoltages.aVR.toFixed(2)} mV.`
    ),
    check(
      "qrs-dominates-p",
      "QRS exceeds P wave",
      "morphology-plausibility",
      Math.abs(qrsState.leadVoltages.II) > Math.abs(pState.leadVoltages.II) ? "pass" : "caution",
      "The ventricular signal should usually dominate atrial depolarization in this teaching model."
    ),
    check(
      "baseline-small",
      "Baseline is near quiet",
      "morphology-plausibility",
      Math.abs(baseline.leadVoltages.II) < 0.12 ? "pass" : "caution",
      `Early baseline Lead II is ${baseline.leadVoltages.II.toFixed(2)} mV.`
    ),
    check(
      "reference-envelope",
      "Reference envelope agreement",
      "reference-agreement",
      Math.abs(tState.leadVoltages.II) < Math.abs(qrsState.leadVoltages.II) + 0.2 ? "pass" : "caution",
      "Synthetic reference overlays are generated from an authored envelope and used only for sanity comparison."
    )
  ];

  return {
    scenarioId: scenario.id,
    checks
  };
}
