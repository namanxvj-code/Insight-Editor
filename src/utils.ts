export const parseCleanInt = (val: any): number => {
  if (typeof val === "number") return isNaN(val) ? 0 : val;
  if (val === null || val === undefined || val === "") return 0;
  const str = String(val).trim();
  const cleanStr = str.replace(/[, \s]/g, "");
  if (/k$/i.test(cleanStr)) {
    return Math.round(parseFloat(cleanStr.replace(/k$/i, "")) * 1000) || 0;
  }
  if (/m$/i.test(cleanStr)) {
    return Math.round(parseFloat(cleanStr.replace(/m$/i, "")) * 1000000) || 0;
  }
  const parsed = parseInt(cleanStr, 10);
  return isNaN(parsed) ? 0 : parsed;
};
