import { useDispatch, useSelector } from "react-redux";
import { setSinglePark, setBookingDetails, setAvailableSlots, setAllSlotsOccupied, toggleAvailableSlots } from "../features/bookings/bookingsSlice";
import {
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
import { formatISTDate, formatISTTime } from '../utils/timeUtils';

const SingleBooking = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { itParks } = useSelector((state) => state.parking);
  const [loading, setLoading] = useState(true);
  const [bookingInitialized, setBookingInitialized] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [showSlots, setShowSlots] = useState(false);

  // Find the park
  const singlePark = itParks.find((park) => park.id === Number(id));

  // Auto-initialize booking with current date and time
  useEffect(() => {
    if (singlePark && !bookingInitialized) {
      const now = new Date();
      const currentDate = now.toISOString().split('T')[0]; // YYYY-MM-DD format
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      // Auto-set booking details with current date and time
      dispatch(setBookingDetails({
        date: currentDate,
        basement: "",
        hour: now.getHours().toString(),
        startTime: currentTime,
        bookingType: 'hardware_based',
        useCustomTime: true,
        customTime: currentTime
      }));
      
      setBookingInitialized(true);
    }
  }, [singlePark, bookingInitialized, dispatch]);

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
      <div className="min-h-screen bg-blue-50 flex items-center justify-center relative overflow-hidden">
        <FloatingElements />
        <motion.div 
          className="text-center z-10"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
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
      <div className="min-h-screen bg-blue-50 relative overflow-hidden">
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

  // Function to check slot availability
  const checkSlotAvailability = async () => {
    if (!singlePark) return;
    
    setSlotsLoading(true);
    // Clear previous slots and set isAvailableSlots to true while loading
    dispatch(setAvailableSlots([]));
    dispatch(setAllSlotsOccupied(false));
    dispatch(toggleAvailableSlots(true));
    
    try {
      const slots = await getSlotAvailability(singlePark.id);

      const basementData = {};
      const availableSlots = [];
      let totalSlots = 0;
      let availableCount = 0;

      slots.forEach(slot => {
        if (!basementData[slot.basement_number]) {
          basementData[slot.basement_number] = {
            total_spots: 0,
            available_spots: 0,
            spots: []
          };
        }

        basementData[slot.basement_number].total_spots++;
        totalSlots++;

        if (slot.status === 'Available') {
          basementData[slot.basement_number].available_spots++;
          availableCount++;
          
          // Add to available slots array for SlotDisplay component
          availableSlots.push({
            id: slot.id,
            spot: slot.slot_number,
            status: slot.status,
            basement_number: slot.basement_number
          });
        }

        basementData[slot.basement_number].spots.push({
          id: slot.id,
          spot: slot.slot_number,
          status: slot.status
        });
      });

      // Update Redux store with available slots
      console.log('Setting available slots:', availableSlots);
      console.log('Available count:', availableCount);
      console.log('Total slots:', totalSlots);
      dispatch(setAvailableSlots(availableSlots));
      dispatch(setAllSlotsOccupied(availableCount === 0));
      
      // Set isAvailableSlots to false after loading is complete
      dispatch(toggleAvailableSlots(false));

      // Update single park with basement data
      dispatch(setSinglePark({
        ...singlePark,
        basements: basementData
      }));

      setShowSlots(true);
      
      if (availableCount === 0) {
        toast.warning('No available slots at this time');
      } else {
        toast.success(`${availableCount} available slots found!`);
      }
    } catch (error) {
      console.error('Error checking slot availability:', error);
      toast.error('Failed to load available slots');
      // Set isAvailableSlots to false even on error
      dispatch(toggleAvailableSlots(false));
    } finally {
      setSlotsLoading(false);
    }
  };

  // No need for basement array since we're not using BookingFilters anymore

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
                    <div className="text-3xl font-bold text-green-600">₹{(singlePark.price_per_hour / 60).toFixed(2)}</div>
                    <div className="text-sm text-gray-600">per minute</div>
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
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                    <FaParking className="text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Booking Options</h3>
                </div>
                {/* Auto-booking display - no user input needed */}
                <div className="space-y-6">
                  {/* Auto-booking info */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs font-bold">i</span>
                      </div>
                      <div>
                        <h3 className="text-blue-800 font-semibold mb-2">Automatic Booking</h3>
                        <p className="text-blue-700 text-sm">
                          Your booking will be automatically set for the current date and time. 
                          Billing starts immediately when you confirm and continues until you leave or cancel.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Current booking details */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-600 text-sm mb-1">Selected Date</p>
                        <p className="text-gray-900 font-semibold">
                          {formatISTDate(new Date(), { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-sm mb-1">Selected Time</p>
                        <p className="text-gray-900 font-semibold">
                          {formatISTTime(new Date(), { 
                            hour: '2-digit', 
                            minute: '2-digit',
                            hour12: true 
                          })}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Rate information */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-800 font-semibold">Rate per minute</p>
                        <p className="text-green-600 text-sm">Pay only for time used</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-600">
                          ₹{(singlePark?.price_per_hour / 60).toFixed(2)}
                        </p>
                        <p className="text-green-600 text-sm">per minute</p>
                      </div>
                    </div>
                  </div>
                </div>
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
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                      <FaClock className="text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">Available Slots</h3>
                  </div>
                  
                  {!showSlots && (
                    <button
                      onClick={checkSlotAvailability}
                      disabled={slotsLoading}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1.5"
                    >
                      {slotsLoading ? (
                        <>
                          <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                          <span>Loading...</span>
                        </>
                      ) : (
                        <>
                          <FaParking className="text-xs" />
                          <span>Check Slots</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {showSlots ? (
                  <SlotDisplay data={singlePark} />
                ) : (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FaParking className="text-gray-400 text-xl" />
                    </div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">Ready to Check Slots?</h4>
                    <p className="text-gray-600 text-sm">
                      Click the button above to see available parking slots for the current time.
                    </p>
                  </div>
                )}
              </div>
            </AnimatedCard>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default SingleBooking;
