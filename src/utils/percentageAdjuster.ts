/**
 * Utility to parse percentage string or number into a clean float value.
 */
export function parsePercentValue(val: any): number {
  if (typeof val === "number") return isNaN(val) ? 0 : val;
  if (!val) return 0;
  const str = String(val).replace(/%/g, "").trim();
  const parsed = parseFloat(str);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Smart auto-adjustment algorithm for percentage-based charts/bars.
 * 
 * Given user input for the first bar and the total number of bars:
 * 1. The first bar keeps the value entered by the user (clamped between min required 100/count and 100).
 * 2. All remaining bars are automatically calculated in descending order.
 * 3. All bars sum to EXACTLY 100%.
 * 4. No bar value is negative.
 * 5. Floating point precision is handled so displayed numbers sum to 100.0%.
 */
export function recalculateDescendingPercentages(
  firstInput: number | string,
  count: number,
  decimals: number = 1,
  appendPercentSymbol: boolean = true
): string[] {
  if (count <= 0) return [];
  const factor = Math.pow(10, decimals);
  
  if (count === 1) {
    return [appendPercentSymbol ? "100.0%" : "100.0"];
  }

  const rawFirst = parsePercentValue(firstInput);
  // Minimum first bar required so descending sum can reach 100%
  const minFirst = 100 / count;
  const clampedFirst = Math.min(100, Math.max(minFirst, rawFirst));
  
  let bar1 = Math.round(clampedFirst * factor) / factor;
  if (bar1 < minFirst) {
    bar1 = Math.ceil(minFirst * factor) / factor;
  }
  if (bar1 > 100) {
    bar1 = 100;
  }

  const remCount = count - 1;
  let remainingTotal = Math.round((100 - bar1) * factor) / factor;

  const rawBars: number[] = new Array(count);
  rawBars[0] = bar1;

  if (remainingTotal <= 0 || remCount <= 0) {
    for (let i = 1; i < count; i++) {
      rawBars[i] = 0;
    }
  } else {
    let unallocated = remainingTotal;
    let currentCap = bar1;

    for (let i = 0; i < remCount; i++) {
      const numLeft = remCount - i;
      // Linear decreasing weight ratio for remaining bars
      const weightProp = 2 / (numLeft + 1);
      let val = unallocated * weightProp;

      val = Math.min(val, currentCap);
      val = Math.min(val, unallocated);
      val = Math.round(val * factor) / factor;
      if (val > unallocated) val = unallocated;

      rawBars[i + 1] = val;
      unallocated = Math.round((unallocated - val) * factor) / factor;
      currentCap = val;
    }

    // Distribute any floating point rounding leftover
    let guard = 0;
    while (unallocated > 0.0001 && guard < 100) {
      guard++;
      let added = false;
      const step = 1 / factor;
      for (let i = 1; i < count; i++) {
        if (Math.round((rawBars[i] + step) * factor) / factor <= rawBars[i - 1]) {
          rawBars[i] = Math.round((rawBars[i] + step) * factor) / factor;
          unallocated = Math.round((unallocated - step) * factor) / factor;
          added = true;
          if (unallocated <= 0.0001) break;
        }
      }
      if (!added) {
        for (let i = count - 1; i >= 1; i--) {
          if (Math.round((rawBars[i] + step) * factor) / factor <= rawBars[i - 1]) {
            rawBars[i] = Math.round((rawBars[i] + step) * factor) / factor;
            unallocated = Math.round((unallocated - step) * factor) / factor;
            break;
          }
        }
      }
    }

    while (unallocated < -0.0001 && guard < 200) {
      guard++;
      let subtracted = false;
      const step = 1 / factor;
      for (let i = count - 1; i >= 1; i--) {
        if (rawBars[i] >= step) {
          rawBars[i] = Math.round((rawBars[i] - step) * factor) / factor;
          unallocated = Math.round((unallocated + step) * factor) / factor;
          subtracted = true;
          if (unallocated >= -0.0001) break;
        }
      }
      if (!subtracted) break;
    }
  }

  // Final check to guarantee exact integer sum in units of 1/factor
  let currentSum = 0;
  for (let i = 0; i < count; i++) {
    currentSum += Math.round(rawBars[i] * factor);
  }
  const diffInUnits = Math.round(100 * factor) - currentSum;
  if (diffInUnits !== 0) {
    if (diffInUnits > 0) {
      let remDiff = diffInUnits;
      for (let i = 1; i < count && remDiff > 0; i++) {
        const maxCanAdd = Math.round((rawBars[i - 1] - rawBars[i]) * factor);
        const add = Math.min(remDiff, Math.max(0, maxCanAdd));
        if (add > 0) {
          rawBars[i] = (Math.round(rawBars[i] * factor) + add) / factor;
          remDiff -= add;
        }
      }
    } else {
      let remDiff = -diffInUnits;
      for (let i = count - 1; i >= 1 && remDiff > 0; i--) {
        const canSub = Math.round(rawBars[i] * factor);
        const sub = Math.min(remDiff, canSub);
        if (sub > 0) {
          rawBars[i] = (Math.round(rawBars[i] * factor) - sub) / factor;
          remDiff -= sub;
        }
      }
    }
  }

  return rawBars.map((v) => {
    const formatted = v.toFixed(decimals);
    return appendPercentSymbol ? `${formatted}%` : formatted;
  });
}
