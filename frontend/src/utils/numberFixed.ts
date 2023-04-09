export const numberFixed = (numStr?: string, dec?: number) => {
  const num = Number(numStr);
  const decimal = dec ? dec : 4;
  return isNaN(num) ? (0).toFixed(4) : num.toFixed(decimal);
};
