import { motion } from "framer-motion";

const ShimmerButton = ({ children, className = "", onClick, ...props }) => {
  return (
    <motion.button
      className={`relative overflow-hidden rounded-xl bg-blue-600 text-white font-semibold px-8 py-4 transition-all duration-300 flex items-center justify-center gap-3 ${className}`}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      {...props}
    >
      {/* Content */}
      <span className="relative z-10 flex items-center justify-center gap-3">
        {children}
      </span>
    </motion.button>
  );
};

export default ShimmerButton;
