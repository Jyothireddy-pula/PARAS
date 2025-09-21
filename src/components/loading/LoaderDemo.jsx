import { useState } from 'react';
import Loader from './Loader';

const LoaderDemo = () => {
  const [showLoader, setShowLoader] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const handleStartLoader = () => {
    setShowLoader(true);
    setIsLoaded(false);
  };

  const handleLoaderComplete = () => {
    setShowLoader(false);
    setIsLoaded(true);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center">
        <h1 className="text-3xl font-bold mb-4 text-gray-800">
          3D Car Loader Demo
        </h1>
        
        {!showLoader && !isLoaded && (
          <div>
            <p className="text-gray-600 mb-6">
              Click the button below to see the 3D car loader in action!
            </p>
            <button
              onClick={handleStartLoader}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors"
            >
              Start 3D Loader
            </button>
          </div>
        )}

        {isLoaded && (
          <div>
            <div className="text-green-500 text-6xl mb-4">✓</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Loading Complete!
            </h2>
            <p className="text-gray-600 mb-4">
              The 3D car has successfully parked and the dashboard is ready.
            </p>
            <button
              onClick={() => setIsLoaded(false)}
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition-colors"
            >
              Reset Demo
            </button>
          </div>
        )}

        {showLoader && <Loader show3D={true} onComplete={handleLoaderComplete} />}
      </div>
    </div>
  );
};

export default LoaderDemo;
