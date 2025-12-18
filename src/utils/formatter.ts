export const formatPrice = (price: number, currency = 'USD') => {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(price);
  } catch (e) {
    return `${price} ${currency}`;
  }
};
