import { useDispatch, useSelector } from "react-redux";
import { setSinglePark } from "../features/bookings/bookingsSlice";
import {
  BookingFilters,
  SlotDisplay,
  Carousel,
  ParkNotFound,
  Navbar,
} from "../components/index";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getSlotAvailability } from '../utils/slotManagement';
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import FloatingElements from "../components/ui/FloatingElements";
import AnimatedCard from "../components/ui/AnimatedCard";
import AnimatedHeader from "../components/ui/AnimatedHeader";
import ShimmerButton from "../components/ui/ShimmerButton";
import { FaParking, FaClock, FaMapMarkerAlt, FaBuilding } from "react-icons/fa";

const SingleBooking = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { itParks } = useSelector((state) => state.parking);
  const [loading, setLoading] = useState(true);

  // Find the park
  const singlePark = itParks.find((park) => park.id === Number(id));

  useEffect(() => {
    const initializeParkData = async () => {
      if (singlePark) {
        try {
          const slots = await getSlotAvailability(singlePark.id);

          const basementData = {};
          slots.forEach(slot => {
            if (!basementData[slot.basement_number]) {
              basementData[slot.basement_number] = {
                total_spots: 0,
                available_spots: 0,
                spots: []
              };
            }

            basementData[slot.basement_number].total_spots++;
            if (slot.status === 'Available') {
              basementData[slot.basement_number].available_spots++;
            }

            basementData[slot.basement_number].spots.push({
              id: slot.id,
              spot: slot.slot_number,
              status: slot.status
            });
          });

          dispatch(setSinglePark({
            ...singlePark,
            basements: basementData
          }));
        } catch (error) {
          console.error('Error initializing park data:', error);
          toast.error('Error loading parking data');
        }
      }
      setLoading(false);
    };

    initializeParkData();
  }, [singlePark, dispatch]);

  // Debug logging
  useEffect(() => {
    console.log('Single Park Data:', singlePark);
  }, [singlePark]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center relative overflow-hidden">
        <FloatingElements />
        <motion.div 
          className="text-center z-10"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <FaParking className="text-white text-2xl" />
          </div>
          <span className="text-xl font-semibold text-gray-700">
            Loading parking details...
          </span>
        </motion.div>
      </div>
    );
  }

  if (!singlePark) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
        <FloatingElements />
        <div className="w-full bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20">
          <Navbar />
        </div>
        <div className="container mx-auto px-4 py-6 relative z-10">
          <ParkNotFound />
        </div>
      </div>
    );
  }

  // Generate basement array for BookingFilters
  const basementArray = Array.from(
    { length: singlePark.basement_total }, 
    (_, i) => `B${i + 1}`
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      <FloatingElements />
      
      {/* Header */}
      <motion.div 
        className="w-full bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20 relative z-10 pt-16 md:pt-0"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Navbar />
      </motion.div>
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Park Info Header */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <AnimatedCard className="overflow-hidden">
            <div className="p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                      <FaBuilding className="text-white text-xl" />
                    </div>
                    <div>
                      <span className="text-2xl font-bold text-gray-900">
                        {singlePark.name || 'Parking Location'}
                      </span>
                      <div className="flex items-center space-x-4 mt-2">
                        <div className="flex items-center space-x-1 text-gray-600">
                          <FaMapMarkerAlt className="text-sm" />
                          <span className="text-sm">{singlePark.address}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-gray-600">
                          <FaClock className="text-sm" />
                          <span className="text-sm">24/7 Available</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">₹{singlePark.price_per_hour}</div>
                    <div className="text-sm text-gray-600">per hour</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{singlePark.basement_total}</div>
                    <div className="text-sm text-gray-600">basements</div>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedCard>
        </motion.div>

        {/* Carousel Section */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Carousel data={singlePark} />
        </motion.div>

        {/* Main Content Grid */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {/* Booking Filters */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <AnimatedCard className="h-full">
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                    <FaParking className="text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Booking Options</h3>
                </div>
                <BookingFilters 
                  basements={basementArray}
                  singlePark={singlePark} 
                />
              </div>
            </AnimatedCard>
          </motion.div>
          
          {/* Slot Display */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="h-full flex justify-center"
          >
            <AnimatedCard className="w-full">
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                    <FaClock className="text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Available Slots</h3>
                </div>
                <SlotDisplay data={singlePark} />
              </div>
            </AnimatedCard>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default SingleBooking;
