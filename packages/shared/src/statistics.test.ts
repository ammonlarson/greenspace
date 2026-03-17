import { describe, expect, it } from "vitest";
import {
  buildConfusionMatrix,
  computeCohensKappa,
  interpretKappa,
} from "./statistics.js";

describe("buildConfusionMatrix", () => {
  it("builds a 2x2 matrix from binary ratings", () => {
    const r1 = ["yes", "yes", "no", "no"];
    const r2 = ["yes", "no", "no", "no"];
    const categories = ["no", "yes"];
    const matrix = buildConfusionMatrix(r1, r2, categories);

    // r1=yes,r2=yes -> (1,1)=1; r1=yes,r2=no -> (1,0)=1; r1=no,r2=no -> (0,0)=2
    expect(matrix).toEqual([
      [2, 0],
      [1, 1],
    ]);
  });

  it("builds a 3x3 matrix for three categories", () => {
    const r1 = ["a", "b", "c", "a", "b"];
    const r2 = ["a", "b", "b", "c", "b"];
    const categories = ["a", "b", "c"];
    const matrix = buildConfusionMatrix(r1, r2, categories);

    expect(matrix).toEqual([
      [1, 0, 1],
      [0, 2, 0],
      [0, 1, 0],
    ]);
  });

  it("returns all zeros for completely mismatched categories", () => {
    const r1 = ["a", "a"];
    const r2 = ["b", "b"];
    const categories = ["a", "b"];
    const matrix = buildConfusionMatrix(r1, r2, categories);

    expect(matrix).toEqual([
      [0, 2],
      [0, 0],
    ]);
  });

  it("throws when a rating is not in the categories list", () => {
    const r1 = ["a", "b", "c"];
    const r2 = ["a", "b", "b"];
    const categories = ["a", "b"];

    expect(() => buildConfusionMatrix(r1, r2, categories)).toThrow(
      'Rating "c" at index 2 (rater 1) is not in the categories list',
    );
  });
});

describe("computeCohensKappa", () => {
  it("returns kappa = 1 for perfect agreement", () => {
    const ratings = ["a", "b", "c", "a", "b"];
    const result = computeCohensKappa(ratings, ratings);

    expect(result.kappa).toBe(1);
    expect(result.observedAgreement).toBe(1);
    expect(result.totalItems).toBe(5);
  });

  it("computes kappa for a known textbook example", () => {
    // Classic example: 50 items, 2 raters, 2 categories
    // Rater1: 25 yes, 25 no
    // Rater2: 30 yes, 20 no
    // Agreement on yes: 20, agreement on no: 15
    // Confusion matrix:
    //        R2=yes  R2=no
    // R1=yes   20      5     = 25
    // R1=no    10     15     = 25
    //          30     20     = 50
    const r1: string[] = [];
    const r2: string[] = [];

    // 20 both say yes
    for (let i = 0; i < 20; i++) { r1.push("yes"); r2.push("yes"); }
    // 5 r1=yes, r2=no
    for (let i = 0; i < 5; i++) { r1.push("yes"); r2.push("no"); }
    // 10 r1=no, r2=yes
    for (let i = 0; i < 10; i++) { r1.push("no"); r2.push("yes"); }
    // 15 both say no
    for (let i = 0; i < 15; i++) { r1.push("no"); r2.push("no"); }

    const result = computeCohensKappa(r1, r2);

    // Po = (20 + 15) / 50 = 0.70
    expect(result.observedAgreement).toBeCloseTo(0.7, 10);

    // Pe = (25*30 + 25*20) / 50^2 = (750 + 500) / 2500 = 0.50
    expect(result.expectedAgreement).toBeCloseTo(0.5, 10);

    // kappa = (0.70 - 0.50) / (1 - 0.50) = 0.40
    expect(result.kappa).toBeCloseTo(0.4, 10);

    expect(result.totalItems).toBe(50);
    expect(result.categories).toEqual(["no", "yes"]);
  });

  it("returns kappa = 0 when agreement equals chance", () => {
    // If observed agreement equals expected agreement, kappa = 0
    // Two raters independently choosing categories with the same distribution
    // by design produce Po ≈ Pe
    const r1 = ["a", "a", "b", "b"];
    const r2 = ["a", "b", "a", "b"];

    const result = computeCohensKappa(r1, r2);

    // Po = 2/4 = 0.5, Pe = (2*2 + 2*2) / 16 = 8/16 = 0.5
    expect(result.kappa).toBeCloseTo(0, 10);
    expect(result.observedAgreement).toBeCloseTo(0.5, 10);
    expect(result.expectedAgreement).toBeCloseTo(0.5, 10);
  });

  it("returns negative kappa for less-than-chance agreement", () => {
    // Complete disagreement on binary
    const r1 = ["a", "a", "b", "b"];
    const r2 = ["b", "b", "a", "a"];

    const result = computeCohensKappa(r1, r2);

    expect(result.kappa).toBeLessThan(0);
    expect(result.observedAgreement).toBe(0);
  });

  it("handles single-category ratings (all same)", () => {
    const r1 = ["a", "a", "a"];
    const r2 = ["a", "a", "a"];

    const result = computeCohensKappa(r1, r2);

    // Pe = 1, so kappa = 0 by convention
    expect(result.kappa).toBe(0);
    expect(result.observedAgreement).toBe(1);
    expect(result.expectedAgreement).toBe(1);
  });

  it("handles many categories", () => {
    const categories = ["cat", "dog", "bird", "fish", "snake"];
    const r1 = ["cat", "dog", "bird", "fish", "snake", "cat", "dog", "bird", "fish", "snake"];
    const r2 = ["cat", "dog", "bird", "fish", "snake", "dog", "cat", "fish", "bird", "snake"];

    const result = computeCohensKappa(r1, r2);

    // 6 out of 10 agree
    expect(result.observedAgreement).toBeCloseTo(0.6, 10);
    expect(result.categories).toEqual([...categories].sort());
    expect(result.totalItems).toBe(10);
    expect(result.kappa).toBeGreaterThan(0);
    expect(result.kappa).toBeLessThan(1);
  });

  it("throws for empty arrays", () => {
    expect(() => computeCohensKappa([], [])).toThrow(
      "Rating arrays must not be empty",
    );
  });

  it("throws for arrays of different lengths", () => {
    expect(() => computeCohensKappa(["a", "b"], ["a"])).toThrow(
      "Rating arrays must have the same length (got 2 and 1)",
    );
  });

  it("sorts categories alphabetically", () => {
    const r1 = ["z", "a", "m"];
    const r2 = ["a", "m", "z"];

    const result = computeCohensKappa(r1, r2);

    expect(result.categories).toEqual(["a", "m", "z"]);
  });

  it("handles asymmetric category usage between raters", () => {
    // Rater 1 uses {a, b, c} but rater 2 only uses {a, b}
    const r1 = ["a", "b", "c", "a"];
    const r2 = ["a", "b", "b", "a"];

    const result = computeCohensKappa(r1, r2);

    expect(result.categories).toEqual(["a", "b", "c"]);
    expect(result.totalItems).toBe(4);
    // 3 out of 4 agree (indices 0, 1, 3)
    expect(result.observedAgreement).toBeCloseTo(0.75, 10);
    expect(result.kappa).toBeGreaterThan(0);
    expect(result.kappa).toBeLessThan(1);
  });

  it("produces correct confusion matrix dimensions", () => {
    const r1 = ["a", "b", "c"];
    const r2 = ["b", "c", "a"];

    const result = computeCohensKappa(r1, r2);

    expect(result.confusionMatrix.length).toBe(3);
    for (const row of result.confusionMatrix) {
      expect(row.length).toBe(3);
    }
  });
});

describe("interpretKappa", () => {
  it("interprets negative kappa as poor", () => {
    expect(interpretKappa(-0.5)).toBe("poor");
    expect(interpretKappa(-0.01)).toBe("poor");
  });

  it("interprets 0-0.20 as slight", () => {
    expect(interpretKappa(0)).toBe("slight");
    expect(interpretKappa(0.1)).toBe("slight");
    expect(interpretKappa(0.2)).toBe("slight");
  });

  it("interprets 0.21-0.40 as fair", () => {
    expect(interpretKappa(0.21)).toBe("fair");
    expect(interpretKappa(0.4)).toBe("fair");
  });

  it("interprets 0.41-0.60 as moderate", () => {
    expect(interpretKappa(0.41)).toBe("moderate");
    expect(interpretKappa(0.6)).toBe("moderate");
  });

  it("interprets 0.61-0.80 as substantial", () => {
    expect(interpretKappa(0.61)).toBe("substantial");
    expect(interpretKappa(0.8)).toBe("substantial");
  });

  it("interprets 0.81-1.0 as almost perfect", () => {
    expect(interpretKappa(0.81)).toBe("almost perfect");
    expect(interpretKappa(1.0)).toBe("almost perfect");
  });

  it("throws for NaN", () => {
    expect(() => interpretKappa(NaN)).toThrow("Kappa value must be a finite number");
  });

  it("throws for Infinity", () => {
    expect(() => interpretKappa(Infinity)).toThrow("Kappa value must be a finite number");
    expect(() => interpretKappa(-Infinity)).toThrow("Kappa value must be a finite number");
  });
});
