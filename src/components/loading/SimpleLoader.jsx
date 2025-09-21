import { motion } from 'framer-motion';
import { FaCar, FaParking } from 'react-icons/fa';

const SimpleLoader = ({ onComplete }) => {
  return (
    <motion.div 
      className="fixed inset-0 bg-blue-50 z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="text-center">
        {/* Logo */}
        <motion.div
          className="mb-8"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="w-24 h-24 mx-auto bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
            <FaParking className="text-white text-3xl" />
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          className="text-3xl font-bold text-gray-800 mb-2"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          PARAS
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="text-gray-600 mb-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          Preparing your dashboard...
        </motion.p>

        {/* Loading Animation */}
        <motion.div
          className="flex justify-center items-center space-x-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <motion.div
            className="w-3 h-3 bg-blue-600 rounded-full"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{ 
              duration: 1.5,
              repeat: Infinity,
              delay: 0
            }}
          />
          <motion.div
            className="w-3 h-3 bg-blue-600 rounded-full"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{ 
              duration: 1.5,
              repeat: Infinity,
              delay: 0.2
            }}
          />
          <motion.div
            className="w-3 h-3 bg-blue-600 rounded-full"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{ 
              duration: 1.5,
              repeat: Infinity,
              delay: 0.4
            }}
          />
        </motion.div>

        {/* Car Animation */}
        <motion.div
          className="mt-8 w-64 mx-auto relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.0 }}
        >
          {/* Road */}
          <div className="w-full bg-gray-300 rounded-full h-3 relative">
            {/* Road lines */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-full h-0.5 bg-white opacity-50"></div>
            </div>
          </div>
          
          {/* Moving Car - positioned above the road */}
          <motion.div
            className="absolute top-0 left-0 transform -translate-y-1/2"
            initial={{ x: -20 }}
            animate={{ x: "calc(100% + 20px)" }}
            transition={{ duration: 3, ease: "easeInOut" }}
            onAnimationComplete={() => {
              setTimeout(() => {
                if (onComplete) onComplete();
              }, 500);
            }}
          >
            <FaCar className="text-blue-600 text-2xl drop-shadow-lg" />
          </motion.div>
          
          {/* Loading percentage */}
          <motion.div
            className="mt-2 text-sm text-gray-600 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.2 }}
          >
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 1.5 }}
            >
              Loading...
            </motion.span>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default SimpleLoader;
