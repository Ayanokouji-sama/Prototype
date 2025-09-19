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
    <div className="h-screen w-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="relative mb-8">
          {/* Changed spinner colors to be visible on a dark background */}
          <div className="w-24 h-24 border-4 border-gray-700 rounded-full animate-spin border-t-white mx-auto"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            {/* Changed pulsing dot to white */}
            <div className="w-10 h-10 bg-white/80 rounded-full animate-pulse"></div>
          </div>
        </div>
        {/* Changed text colors to white */}
        <h2 className="text-3xl font-bold text-white mb-4">
          Preparing Your Session...
        </h2>
        <p className="text-gray-300">
          Your AI counselor is getting ready to chat with you.
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;
