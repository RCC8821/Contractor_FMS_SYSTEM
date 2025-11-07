import React from 'react';

const NotFound = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800">404 - Page Not Found</h1>
        <p className="text-gray-600 mt-4">The page you are looking for does not exist.</p>
      </div>
    </div>
  );
};

export default NotFound;