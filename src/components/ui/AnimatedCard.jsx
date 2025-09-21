import { motion } from "framer-motion";

const AnimatedCard = ({ children, className = "", delay = 0, ...props }) => {
  return (
    <motion.div
      className={`relative rounded-2xl bg-white shadow-lg border border-gray-100 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      {...props}
    >
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
};

export default AnimatedCard;
