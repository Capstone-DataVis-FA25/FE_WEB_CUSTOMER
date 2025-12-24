import React from 'react';
import ForecastList from './components/ForecastList';
import Routers from '@/router/routers';
import { useNavigate } from 'react-router-dom';

const ForecastPage: React.FC = () => {
  const navigate = useNavigate();

  const handleCreateNew = () => {
    navigate(Routers.FORECAST_NEW);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 pt-8 pb-16">
      <div className="max-w-[95vw] mx-auto px-4 sm:px-6 lg:px-8">
        <ForecastList onCreateNew={handleCreateNew} />
      </div>
    </div>
  );
};

export default ForecastPage;
