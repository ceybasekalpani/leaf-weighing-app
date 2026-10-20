// SQL money values have four decimal places. Use integer units to keep
// frontend totals consistent with the backend decimal calculations.
const weightUnits = (value) => {
  const weight = Number(value ?? 0);
  return Number.isFinite(weight) ? Math.round(weight * 10000) : 0;
};

// Input gross is the original measured weight.
export const calculateAdjustedGross = ({ gross, superDeduction, normalDeduction } = {}) => (
  weightUnits(gross) - weightUnits(superDeduction) - weightUnits(normalDeduction)
) / 10000;

// API gross/totalGross already has Super and Normal deducted.
export const calculateNetWeightFromAdjustedGross = ({
  gross, bagWeight, water, coarse, rejected, boiled,
} = {}) => (
  weightUnits(gross)
  - weightUnits(bagWeight)
  - weightUnits(water)
  - weightUnits(coarse)
  - weightUnits(rejected)
  - weightUnits(boiled)
) / 10000;

// Use this entry point only when starting from the original measured gross.
export const calculateNetWeight = ({ superDeduction, normalDeduction, ...weights } = {}) =>
  calculateNetWeightFromAdjustedGross({
    ...weights,
    gross: calculateAdjustedGross({ gross: weights.gross, superDeduction, normalDeduction }),
  });

// Legacy API responses expose original gross as gross/totalGross. Updated
// responses expose original gross separately as rawGross/totalRawGross.
// In both versions, start from the original weight and deduct exactly once.
export const getAdjustedGrossFromSummary = (summary = {}) => calculateAdjustedGross({
  gross: summary.totalRawGross ?? summary.TotalRawGross ?? summary.rawGross ?? summary.RawGross
    ?? summary.totalGross ?? summary.TotalGross ?? summary.gross ?? summary.Gross ?? 0,
  superDeduction: summary.totalSuperDeduction ?? summary.TotalSuperDeduction ?? 0,
  normalDeduction: summary.totalNormalDeduction ?? summary.TotalNormalDeduction ?? 0,
});

export const normalizeCollectionWeights = (summary) => {
  const gross = getAdjustedGrossFromSummary(summary);
  return {
    ...summary,
    rawGross: summary.rawGross ?? summary.gross ?? '0',
    gross: gross.toString(),
    netWeight: calculateNetWeightFromAdjustedGross({
      gross,
      bagWeight: summary.totalBagWeight,
      water: summary.totalWater,
      coarse: summary.totalCoarce,
      rejected: summary.totalRejected,
      boiled: summary.totalBoiled,
    }).toString(),
  };
};
