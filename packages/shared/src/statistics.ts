/**
 * Inter-rater agreement scoring utilities.
 *
 * Implements Cohen's kappa coefficient for measuring agreement
 * between two raters on categorical data.
 */

/** Result of a Cohen's kappa computation. */
export interface CohensKappaResult {
  /** Cohen's kappa coefficient (-1 to 1). */
  kappa: number;
  /** Proportion of observed agreement (0 to 1). */
  observedAgreement: number;
  /** Proportion of expected (chance) agreement (0 to 1). */
  expectedAgreement: number;
  /** Total number of rated items. */
  totalItems: number;
  /** Ordered list of unique categories found in the data. */
  categories: string[];
  /** Confusion matrix: matrix[i][j] = count where rater1 chose categories[i] and rater2 chose categories[j]. */
  confusionMatrix: number[][];
}

/** Qualitative interpretation of a kappa value (Landis & Koch, 1977). */
export type KappaInterpretation =
  | "poor"
  | "slight"
  | "fair"
  | "moderate"
  | "substantial"
  | "almost perfect";

/**
 * Build a confusion matrix from two arrays of ratings.
 *
 * @param ratings1 - Ratings from rater 1
 * @param ratings2 - Ratings from rater 2
 * @param categories - Ordered list of unique categories
 * @returns 2D matrix where matrix[i][j] = count of items rated as categories[i] by rater 1 and categories[j] by rater 2
 */
export function buildConfusionMatrix(
  ratings1: string[],
  ratings2: string[],
  categories: string[],
): number[][] {
  const categoryIndex = new Map<string, number>();
  for (let i = 0; i < categories.length; i++) {
    categoryIndex.set(categories[i], i);
  }

  const n = categories.length;
  const matrix: number[][] = Array.from({ length: n }, () =>
    Array.from({ length: n }, () => 0),
  );

  for (let i = 0; i < ratings1.length; i++) {
    const row = categoryIndex.get(ratings1[i]);
    const col = categoryIndex.get(ratings2[i]);
    if (row === undefined) {
      throw new Error(`Rating "${ratings1[i]}" at index ${i} (rater 1) is not in the categories list`);
    }
    if (col === undefined) {
      throw new Error(`Rating "${ratings2[i]}" at index ${i} (rater 2) is not in the categories list`);
    }
    matrix[row][col]++;
  }

  return matrix;
}

/**
 * Compute Cohen's kappa coefficient for two raters.
 *
 * Cohen's kappa measures inter-rater agreement for categorical items,
 * correcting for agreement that would be expected by chance.
 *
 * kappa = (Po - Pe) / (1 - Pe)
 *
 * where Po = observed agreement, Pe = expected agreement by chance.
 *
 * @param ratings1 - Array of categorical ratings from rater 1
 * @param ratings2 - Array of categorical ratings from rater 2 (same length as ratings1)
 * @returns Cohen's kappa result with all computed statistics
 * @throws {Error} If input arrays are empty or have different lengths
 */
export function computeCohensKappa(
  ratings1: string[],
  ratings2: string[],
): CohensKappaResult {
  if (ratings1.length === 0 || ratings2.length === 0) {
    throw new Error("Rating arrays must not be empty");
  }

  if (ratings1.length !== ratings2.length) {
    throw new Error(
      `Rating arrays must have the same length (got ${ratings1.length} and ${ratings2.length})`,
    );
  }

  const totalItems = ratings1.length;

  const categorySet = new Set<string>();
  for (const r of ratings1) categorySet.add(r);
  for (const r of ratings2) categorySet.add(r);
  const categories = [...categorySet].sort();

  const confusionMatrix = buildConfusionMatrix(
    ratings1,
    ratings2,
    categories,
  );

  const n = categories.length;

  // Observed agreement: sum of diagonal / total
  let diagonalSum = 0;
  for (let i = 0; i < n; i++) {
    diagonalSum += confusionMatrix[i][i];
  }
  const observedAgreement = diagonalSum / totalItems;

  // Expected agreement: sum of (row_i_total * col_i_total) / total^2
  const rowTotals: number[] = Array.from({ length: n }, () => 0);
  const colTotals: number[] = Array.from({ length: n }, () => 0);

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      rowTotals[i] += confusionMatrix[i][j];
      colTotals[j] += confusionMatrix[i][j];
    }
  }

  let expectedAgreement = 0;
  for (let i = 0; i < n; i++) {
    expectedAgreement += (rowTotals[i] * colTotals[i]) / (totalItems * totalItems);
  }

  // kappa = (Po - Pe) / (1 - Pe)
  // When Pe = 1, both raters assign the same distribution perfectly by chance; kappa is 0.
  const kappa =
    expectedAgreement === 1
      ? 0
      : (observedAgreement - expectedAgreement) / (1 - expectedAgreement);

  return {
    kappa,
    observedAgreement,
    expectedAgreement,
    totalItems,
    categories,
    confusionMatrix,
  };
}

/**
 * Interpret a kappa value using the Landis & Koch (1977) scale.
 *
 * | Kappa        | Interpretation   |
 * |------------- |------------------|
 * | < 0.00       | Poor             |
 * | 0.00 - 0.20  | Slight           |
 * | 0.21 - 0.40  | Fair             |
 * | 0.41 - 0.60  | Moderate         |
 * | 0.61 - 0.80  | Substantial      |
 * | 0.81 - 1.00  | Almost perfect   |
 */
export function interpretKappa(kappa: number): KappaInterpretation {
  if (!Number.isFinite(kappa)) {
    throw new Error("Kappa value must be a finite number");
  }
  if (kappa < 0) return "poor";
  if (kappa <= 0.2) return "slight";
  if (kappa <= 0.4) return "fair";
  if (kappa <= 0.6) return "moderate";
  if (kappa <= 0.8) return "substantial";
  return "almost perfect";
}
