export interface ForecastWindowOption {
  value: string;
  label: string;
}

export const getForecastWindowOptions = (scale: string): ForecastWindowOption[] => {
  switch (scale) {
    case 'Daily':
      return [
        { value: '30', label: '30 days' },
        { value: '90', label: '90 days' },
        { value: '180', label: '180 days' },
        { value: '365', label: '365 days' },
      ];
    case 'Weekly':
      return [
        { value: '4', label: '4 weeks' },
        { value: '12', label: '12 weeks' },
        { value: '36', label: '36 weeks' },
        { value: '52', label: '52 weeks' },
      ];
    case 'Monthly':
      return [
        { value: '3', label: '3 months' },
        { value: '6', label: '6 months' },
        { value: '12', label: '12 months' },
      ];
    case 'Quarterly':
      return [
        { value: '1', label: '1 quarter' },
        { value: '2', label: '2 quarters' },
        { value: '3', label: '3 quarters' },
        { value: '4', label: '4 quarters' },
        { value: '8', label: '8 quarters' },
      ];
    case 'Yearly':
      return [
        { value: '1', label: '1 year' },
        { value: '2', label: '2 years' },
        { value: '3', label: '3 years' },
        { value: '5', label: '5 years' },
        { value: '10', label: '10 years' },
      ];
    default:
      return [
        { value: '30', label: '30 days' },
        { value: '90', label: '90 days' },
        { value: '180', label: '180 days' },
        { value: '365', label: '365 days' },
      ];
  }
};
