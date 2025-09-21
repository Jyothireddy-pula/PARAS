import { motion } from "framer-motion";
import { useState } from "react";

const AnimatedMapContainer = ({ children, className = "" }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className={`relative overflow-hidden rounded-2xl ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8 }}
      whileHover={{ scale: 1.02 }}
    >
      {/* Animated border gradient */}
      <motion.div
        className="absolute inset-0 rounded-2xl"
        style={{
          background: "linear-gradient(45deg, #3B82F6, #8B5CF6, #06B6D4, #10B981)",
          padding: "2px",
        }}
        animate={{
          background: isHovered 
            ? "linear-gradient(45deg, #3B82F6, #8B5CF6, #06B6D4, #10B981, #F59E0B)"
            : "linear-gradient(45deg, #3B82F6, #8B5CF6, #06B6D4, #10B981)",
        }}
        transition={{ duration: 0.5 }}
      />
      
      {/* Inner content */}
      <div className="relative bg-white rounded-2xl h-full w-full overflow-hidden">
        {/* Floating particles overlay */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-blue-400/30 rounded-full"
              style={{
                left: `${20 + i * 15}%`,
                top: `${30 + i * 10}%`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.3, 0.8, 0.3],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 3 + i * 0.5,
                repeat: Infinity,
                delay: i * 0.5,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
        
        {/* Map content */}
        <div className="relative z-10 h-full">
          {children}
        </div>
      </div>
    </motion.div>
  );
};

export default AnimatedMapContainer;
