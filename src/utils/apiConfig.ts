const getApiBackendUrl = () => {
  const environment = import.meta.env.VITE_APP_ENVIRONMENT || 'development';

  if (environment === 'production') {
    return (
      import.meta.env.VITE_APP_BACKEND_CUSTOMER_URL_PRODUCTION || 'https://api.production.com/'
    );
  }

  return (
    import.meta.env.VITE_APP_BACKEND_CUSTOMER_URL_DEVELOPMENT || 'http://localhost:5000/api'
  );
};

export default getApiBackendUrl;