export const round = (num: number, decimals = 2) => {
  const factor = Math.pow(10, decimals);
  return Math.round((num + Number.EPSILON) * factor) / factor;
};

export const calculateDRR = (qty30Days: number) => {
  return qty30Days / 30;
};

export const calculateStockCover = (stock: number, drr: number) => {
  if (drr === 0) return stock > 0 ? 999 : 0; // Infinite cover if sales are 0 but stock exists
  return stock / drr;
};
