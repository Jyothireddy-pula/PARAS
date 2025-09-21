import { Map, Places, MobileMap } from "../components";
import { useNavigate } from "react-router-dom";
import { parking, logo } from "../assets";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SimpleLoader from "../components/loading/SimpleLoader";
import { FaMapMarkerAlt } from "react-icons/fa";
import GlareCard from "../components/ui/GlareCard";
import FloatingElements from "../components/ui/FloatingElements";
import ShimmerButton from "../components/ui/ShimmerButton";
import AnimatedCard from "../components/ui/AnimatedCard";
import AnimatedMapContainer from "../components/ui/AnimatedMapContainer";

const Landing = () => {
  const navigate = useNavigate();
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleLoaderComplete = () => {
    setIsLoading(false);
  };


  const handleLocationSelect = (location, city) => {
    setSelectedLocation(location);
    setSelectedCity(city);
  };

  const handleSearch = () => {
    if (selectedLocation) {
      navigate('/listbookings', { 
        state: { 
          location: selectedLocation, 
          city: selectedCity 
        } 
      });
    }
  };

  return (
    <>
      <AnimatePresence>
        {isLoading && <SimpleLoader onComplete={handleLoaderComplete} />}
      </AnimatePresence>
      
      {!isLoading && (
        <>
          {/* Mobile View - Only Map */}
          <div className="md:hidden h-screen relative bg-blue-50 overflow-hidden">
            <FloatingElements />
        
            <motion.div 
              className="absolute top-16 inset-x-0 bottom-0"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
            >
              <AnimatedMapContainer className="h-full w-full rounded-none overflow-hidden">
                <MobileMap />
              </AnimatedMapContainer>
            </motion.div>

        {/* Mobile Search Overlay - Floating at bottom */}
        <motion.div 
          className="absolute bottom-4 left-4 right-4 z-30"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-white/30">
            <div className="flex items-center justify-center mb-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-2">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-gray-900">
                Find Parking Spots
              </h2>
            </div>
            <div className="space-y-3">
              <div className="relative z-20">
                <Places 
                  setUserLocation={handleLocationSelect}
                  customClass="shadow-none rounded-xl text-base p-3 bg-gray-50 border border-gray-200 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="relative z-10">
                <ShimmerButton 
                  onClick={handleSearch}
                  className="w-full text-base py-3 rounded-xl"
                >
                  🔍 Search Parking
                </ShimmerButton>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Desktop View - Map + Search Panel */}
      <div className="hidden md:flex h-[calc(100vh-120px)] relative bg-blue-50">
        <FloatingElements />
        
        {/* Map Section */}
        <motion.div 
          className="w-2/3 p-8"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <AnimatedMapContainer className="h-full rounded-2xl overflow-hidden 
            shadow-[0_4px_20px_-2px_rgba(0,0,0,0.2)]">
            <Map className="w-full h-full" />
          </AnimatedMapContainer>
        </motion.div>

        {/* Search Section */}
        <motion.div 
          className="w-1/3 p-8 
            bg-white/60 backdrop-blur-sm
            flex flex-col justify-center
            relative overflow-visible"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {/* Logo Section */}
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <AnimatedCard className="p-6 bg-blue-600">
              <div className="flex items-center justify-center">
                <img 
                  src={logo} 
                  alt="PARAS Logo" 
                  className="w-24 h-24 object-contain"
            />
          </div>
            </AnimatedCard>
          </motion.div>

          {/* Content Section */}
          <motion.div 
            className="mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <h1 className="text-3xl font-bold 
              text-gray-900
              tracking-tight leading-tight mb-2">
              <span className="block">Where to Go?</span>
              <span className="block text-blue-600">
                Find A Parking Spot!!
              </span>
            </h1>
            <motion.p 
              className="text-base text-gray-600 font-normal
                tracking-wide mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 2000 }}
            >
              Find secure parking spots nearby with real-time availability
            </motion.p>
          </motion.div>
          
          <motion.div 
            className="w-full flex flex-col gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
          >
            <AnimatedCard className="p-0 overflow-visible relative z-20" delay={1.4}>
            <Places 
              setUserLocation={handleLocationSelect}
                customClass="shadow-none rounded-lg text-lg p-3 bg-transparent border-none w-full"
              />
            </AnimatedCard>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 1.6 }}
              className="relative z-10"
            >
              <ShimmerButton 
              onClick={handleSearch}
                className="w-full text-lg py-3 relative z-10"
            >
              Find Parking
              </ShimmerButton>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
        </>
      )}
    </>
  );
};

export default Landing;