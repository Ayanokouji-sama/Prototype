import React, { useEffect } from 'react';

const LoadingScreen = ({ onComplete }) => {
  useEffect(() => {
    // This simulates the time it takes for the first AI message to be generated.
    const timer = setTimeout(() => {
      onComplete();
    }, 2500); // 2.5-second delay for a smooth transition

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 flex items-center justify-center">
      <div className="text-center">
        <div className="relative mb-8">
          <div className="w-24 h-24 border-4 border-indigo-200 rounded-full animate-spin border-t-indigo-600 mx-auto"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-10 h-10 bg-indigo-600 rounded-full animate-pulse"></div>
          </div>
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          Preparing Your Session...
        </h2>
        <p className="text-gray-600">
          Your AI counselor is getting ready to chat with you.
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;

