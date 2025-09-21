import { Link } from "react-router-dom";
import useDistance from '../../hooks/useDistance';
import { motion } from "framer-motion";
import { useState } from "react";

const ParkCard = ({
  park,
  duration,
  onClick,
  containerClassName,
  imageClassName,
  showButton,
  index = 0,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Log the coordinates to debug
  console.log('Park coordinates:', park.latitude, park.longitude);
  
  // Convert coordinates to numbers if they're strings
  const parkLat = Number(park.latitude);
  const parkLng = Number(park.longitude);
  
  const calculatedDistance = useDistance(parkLat, parkLng);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -8 }}
      className={`${containerClassName}`}
    >
      <Link
        to={`/listbookings/${park.id}`}
        className="block bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group"
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <figure className="relative overflow-hidden">
          <motion.img
            src={park.image_url}
            alt={park.name}
            className={`w-full object-cover ${imageClassName}`}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          />
          
          {/* Gradient overlay */}
          <motion.div
            className="absolute inset-0 bg-black/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          />
          
          {/* Price badge */}
          <motion.div 
            className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-gray-900 px-3 py-1 rounded-full text-sm font-semibold shadow-lg"
            whileHover={{ scale: 1.05 }}
          >
            ₹{(park.price_per_hour / 60).toFixed(2)}/min
          </motion.div>

          {/* Availability indicator */}
          <motion.div 
            className="absolute top-3 right-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5 + index * 0.1 }}
          >
            Available
          </motion.div>

          {showButton && (
            <motion.button 
              className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white px-6 py-2 rounded-full font-medium shadow-lg z-10"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              Book Now
            </motion.button>
          )}
        </figure>

        <div className="p-6">
          <motion.h2 
            className="text-gray-900 font-bold text-lg mb-3 line-clamp-1"
            whileHover={{ color: "#3B82F6" }}
            transition={{ duration: 0.2 }}
          >
            {park.address}
          </motion.h2>
          
          <div className="space-y-3">
            <motion.div 
              className="flex items-center text-gray-600 group-hover:text-gray-800 transition-colors"
              whileHover={{ x: 4 }}
              transition={{ duration: 0.2 }}
            >
              <motion.div
                className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.2 }}
              >
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </motion.div>
              <p className="text-sm">
                Total Basements: <span className="font-semibold text-blue-600">{park.basement_total}</span>
              </p>
            </motion.div>

            <motion.div 
              className="flex items-center text-gray-600 group-hover:text-gray-800 transition-colors"
              whileHover={{ x: 4 }}
              transition={{ duration: 0.2 }}
            >
              <motion.div
                className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.2 }}
              >
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </motion.div>
              <p className="text-sm">
                Distance: <span className="font-semibold text-green-600">{calculatedDistance || 'Calculating...'}</span>
              </p>
            </motion.div>

            <motion.div 
              className="flex items-center text-gray-600 group-hover:text-gray-800 transition-colors"
              whileHover={{ x: 4 }}
              transition={{ duration: 0.2 }}
            >
              <motion.div
                className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.2 }}
              >
                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </motion.div>
              <p className="text-sm">
                Duration: <span className="font-semibold text-purple-600">{duration}</span>
              </p>
            </motion.div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ParkCard;
