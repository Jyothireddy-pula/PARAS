import { useDispatch, useSelector } from "react-redux";
import { useMap } from "../MapProvider"; // Custom hook to manage map state
import {
  ParksGrid,
  CityFilter,
  ErrorElement,
  Places,
  LoadingSkeleton,
} from "../components/index";
import { useEffect, useState, useMemo } from "react";
import {
  fetchParkingData,
  resetFilters,
} from "../features/bookings/parkingSlice";
import { setUserLocation } from "../features/bookings/bookingsSlice"; // Redux action for setting location which user selects in places component
import styles from "../style";
import { toast } from "react-toastify";
import { useLocation } from 'react-router-dom'; // Add this if not already present
import { FaMapMarkerAlt, FaSearch, FaFilter } from 'react-icons/fa'; // Import the icons
import { motion, AnimatePresence } from "framer-motion";
import FloatingElements from "../components/ui/FloatingElements";
import ShimmerButton from "../components/ui/ShimmerButton";
import AnimatedCard from "../components/ui/AnimatedCard";
import AnimatedHeader from "../components/ui/AnimatedHeader";

// Add this function at the top of your file, outside the component
const normalizeCity = (cityName) => {
  const cityMap = {
    'bengaluru': 'bangalore',
    'bangalore': 'bangalore'
  };
  return cityMap[cityName.toLowerCase()] || cityName.toLowerCase();
};

const ListBookings = () => {
  const dispatch = useDispatch();
  const { isLoaded } = useMap(); // Check if the map is loaded
  const [userCity, setUserCity] = useState("bangalore");
  const [cityLoading, setCityLoading] = useState(false); // State to manage loading state when changing cities
  const { cities, loading, error } = useSelector((state) => state.parking);
  const location = useLocation();
  const { state } = location;

  // Fetch parking data when the component mounts consisting of cities and complexes and IT Parks from two apis using promise.all
  useEffect(() => {
    dispatch(fetchParkingData());
  }, [dispatch]);

  // Handler for when user selects a new location by using places from google map api
  //handleLocationSelect is a callback function sending data from child to parent which is userlocation and city
  //city is derived from extracting the city name from address components using 'locality' type

  /**
  using a callback function like handleLocationSelect is better than using useEffect for handling immediate user actions, preventing unnecessary renders and providing controlled execution.
   */
  const handleLocationSelect = (location, city) => {
    setCityLoading(true);
    const normalizedCity = normalizeCity(city || 'Bangalore');
    
    console.log('Setting city:', {
      original: city,
      normalized: normalizedCity
    });
    
    dispatch(setUserLocation(location));
    setUserCity(normalizedCity);
    dispatch(resetFilters());
    
    setTimeout(() => {
      setCityLoading(false);
    }, 1000);
    toast.success(`${normalizedCity} selected successfully`);
  };

  // Check if there are parks available in the selected city
  // Users can select a city using the Places component, which utilizes the Google Places Autocomplete API.
  // When a location is selected, the city is extracted from the address components.
  // The selected city filters available parking options, showing only relevant parks.
  // The hasParksInCity check confirms if parks are available in the selected city.

  /**
   * useMemo prevents unnecessary re-computation of complex calculations (such as filtering or transforming data for markers in map) during re-renders, ensuring smoother map interactions
   */
  const hasParksInCity = useMemo(() => {
    const cityNames = cities.map(city => city.name.toLowerCase());
    const normalizedUserCity = normalizeCity(userCity);
    
    console.log('City comparison:', {
      availableCities: cityNames,
      userCity: normalizedUserCity
    });
    
    return cityNames.includes(normalizedUserCity);
  }, [userCity, cities]);

  useEffect(() => {
    if (state?.location) {
      const normalizedCity = normalizeCity(state.city || 'bangalore');
      dispatch(setUserLocation(state.location));
      setUserCity(normalizedCity);
      dispatch(resetFilters());
    }
  }, [state]);

  // Add these console logs to help debug
  useEffect(() => {
    console.log('Current userCity:', userCity);
    console.log('Available cities:', cities);
    console.log('Has parks:', hasParksInCity);
  }, [userCity, cities, hasParksInCity]);

  // Add this near your other useSelector calls
  const parkingState = useSelector((state) => {
    console.log('Full parking state:', state.parking);
    return state.parking;
  });

  // Add this before the return statement
  const filteredParks = useSelector(state => {
    const parks = state.parking.itParks;
    console.log('IT Parks data:', {
      allParks: parks,
      userCity,
      parksForCity: parks.filter(park => 
        park.cities.name.toLowerCase() === normalizeCity(userCity)
      )
    });
    return parks;
  });

  if (cityLoading || loading || !isLoaded) {
    return <LoadingSkeleton count={6} />;
  }

  if (error) {
    return <ErrorElement />;
  }

  return (
    <>
      <div className="min-h-screen bg-blue-50 relative overflow-hidden">
        <FloatingElements />
        
        {/* Header Section */}
        <motion.div 
          className="relative z-10 bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20 pt-16 md:pt-0"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <motion.div 
                className="flex items-center space-x-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
                  <FaMapMarkerAlt className="text-white text-xl" />
                </div>
                <div>
                  <span className="text-2xl font-bold text-gray-900">
                    {userCity || 'Select a city'}
                  </span>
                  <p className="text-sm text-gray-600">Find parking spots near you</p>
                </div>
              </motion.div>
              
              <motion.div 
                className="flex items-center space-x-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                </div>
                <span className="text-sm text-gray-600">Live availability</span>
              </motion.div>
            </div>
          </div>
        </motion.div>
        
        {/* Search Section */}
        <motion.div 
          className="relative z-10 container mx-auto px-4 py-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <AnimatedCard className="max-w-2xl mx-auto">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <FaSearch className="text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Search Location</h3>
              </div>
              
              <div className="space-y-4">
                <Places 
                  setUserLocation={handleLocationSelect}
                  customClass="w-full p-4 text-lg rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 shadow-sm"
                />
                
                <AnimatePresence>
                  {!hasParksInCity && userCity && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="bg-red-50 border border-red-200 rounded-lg p-4"
                    >
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">!</span>
                        </div>
                        <p className="text-red-700 font-medium">No parking services available in this area</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </AnimatedCard>
        </motion.div>
        
        {/* Parks Grid Section */}
        <motion.div 
          className="relative z-10 container mx-auto px-4 pb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div className="mb-6">
            <AnimatedHeader 
              title="Available Parking Spots"
              subtitle="Choose from the best parking locations in your area"
              className="text-center"
            />
          </div>
          
          <ParksGrid 
            userCity={normalizeCity(userCity)} 
            key={userCity} // Add this to force re-render when city changes
          />
        </motion.div>
      </div>
    </>
  );
};

export default ListBookings;
