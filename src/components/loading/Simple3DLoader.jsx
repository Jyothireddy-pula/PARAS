import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const Simple3DLoader = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [isParked, setIsParked] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setProgress(100);
      setIsParked(true);
      setTimeout(() => {
        if (onComplete) {
          onComplete();
        }
      }, 1000);
    }, 4000);

    const progressTimer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressTimer);
          return 100;
        }
        return prev + 2;
      });
    }, 80);

    return () => {
      clearTimeout(timer);
      clearInterval(progressTimer);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-blue-50 z-50 flex items-center justify-center">
      <div className="text-center">
        {/* 3D Car Animation */}
        <div className="relative mb-8">
          {/* Car Container */}
          <div className="relative w-32 h-16 mx-auto">
            {/* Car Body */}
            <div 
              className={`absolute top-4 w-24 h-8 bg-blue-600 rounded-lg transition-all duration-1000 ${
                isParked ? 'translate-x-8' : 'translate-x-0'
              }`}
              style={{
                transform: `translateX(${progress * 0.8}px) ${isParked ? 'translateY(2px)' : 'translateY(0px)'}`,
                boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
              }}
            >
              {/* Car Roof */}
              <div className="absolute top-1 left-2 w-16 h-6 bg-blue-500 rounded-md"></div>
              
              {/* Wheels */}
              <div className="absolute -bottom-1 left-2 w-3 h-3 bg-gray-800 rounded-full"></div>
              <div className="absolute -bottom-1 right-2 w-3 h-3 bg-gray-800 rounded-full"></div>
              
              {/* Headlights */}
              <div className="absolute top-2 right-1 w-1 h-1 bg-yellow-300 rounded-full animate-pulse"></div>
              <div className="absolute top-4 right-1 w-1 h-1 bg-yellow-300 rounded-full animate-pulse"></div>
              
              {/* Taillights */}
              <div className="absolute top-2 left-1 w-1 h-1 bg-red-500 rounded-full"></div>
              <div className="absolute top-4 left-1 w-1 h-1 bg-red-500 rounded-full"></div>
            </div>
            
            {/* Parking Spot */}
            <div className="absolute top-6 right-0 w-8 h-4 border-2 border-white border-dashed rounded"></div>
            
            {/* Road */}
            <div className="absolute top-6 left-0 right-0 h-0.5 bg-gray-400"></div>
          </div>
        </div>

        {/* Loading Text */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2 animate-pulse">
            {isParked ? 'Parked Successfully!' : 'Loading Dashboard...'}
          </h2>
          <p className="text-gray-600">
            {isParked ? 'Preparing your data...' : 'Finding the perfect parking spot...'}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-64 mx-auto mb-4">
          <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-blue-500 h-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="text-sm text-gray-600 mt-2">
            {Math.round(progress)}%
          </div>
        </div>

        {/* Parking Lot Visual */}
        <div className="mt-8">
          <div className="text-sm text-gray-500 mb-2">Smart Parking System</div>
          <div className="flex justify-center space-x-2">
            {[1, 2, 3, 4, 5, 6].map((spot) => (
              <div 
                key={spot}
                className={`w-6 h-4 border-2 border-white rounded ${
                  spot === 6 && isParked ? 'bg-green-200' : 'bg-gray-200'
                }`}
              ></div>
            ))}
          </div>
        </div>

        {/* Animated Dots */}
        <div className="flex justify-center space-x-1 mt-4">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  );
};

Simple3DLoader.propTypes = {
  onComplete: PropTypes.func
};

export default Simple3DLoader;
