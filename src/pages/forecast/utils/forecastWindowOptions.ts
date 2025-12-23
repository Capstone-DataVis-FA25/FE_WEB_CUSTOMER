export interface ForecastWindowOption {
  value: string;
  label: string;
}

// Utility now only defines the canonical preset values.
// Actual labels are built in React components using `t()` for i18n.
export const getForecastWindowOptions = (_scale: string): ForecastWindowOption[] => {
  const values = ['5', '10', '15', '20'];
  return values.map(v => ({ value: v, label: v }));
};
