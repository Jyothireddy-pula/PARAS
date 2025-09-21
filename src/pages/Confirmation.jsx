import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { addBooking } from "../features/mybookings/bookedSlice";
import { InputField, Button, Loader, Navbar } from "../components/index";
import {
  clearBookings,
  setTempBooking,
} from "../features/bookings/bookingsSlice";
import styles from "../style";
import { saveBooking } from "../utils/saveBooking";
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from "framer-motion";
import FloatingElements from "../components/ui/FloatingElements";
import AnimatedCard from "../components/ui/AnimatedCard";
import ShimmerButton from "../components/ui/ShimmerButton";
import { FaCheckCircle, FaCalendarAlt, FaClock, FaMapMarkerAlt, FaCreditCard, FaUser } from "react-icons/fa";

const Confirmation = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  
  const user = useSelector((state) => state.auth.user) || null;

  // Initialize form data
  const [formData, setFormData] = useState({
    vehicleNumber: user?.vehicleNumber || "",
    email: user?.email || "",
  });
  
  const [errors, setErrors] = useState({});

  const {
    singlePark,
    userLocation,
    distance,
    duration,
    bookingsDetails,
    selectedSlot,
  } = useSelector((state) => state.bookings);

  // Auto-fill only if formData is empty
  useEffect(() => {
    if (user && !formData.vehicleNumber) {
      setFormData(prev => ({
        ...prev,
        email: user.email || "",
        vehicleNumber: user.vehicleNumber || "",
      }));
    }
  }, [user]); // Only run when user data changes

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.vehicleNumber) newErrors.vehicleNumber = "Vehicle number is required.";
    if (!formData.email) newErrors.email = "Email is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    try {
      // Get the current authenticated user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('No authenticated user found');
      }

      // Parse the time range
      if (!bookingsDetails.timeRange) {
        throw new Error('Time range is required');
      }

      const [startTime, endTime] = bookingsDetails.timeRange.split('-').map(t => t.trim());
      
      // Validate time format (24-hour format)
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
        throw new Error('Invalid time format. Please use HH:MM format (24-hour)');
      }

      // Create a Date object for the booking date
      if (!bookingsDetails.date) {
        throw new Error('Booking date is required');
      }
      const bookingDate = new Date(bookingsDetails.date);
      if (isNaN(bookingDate.getTime())) {
        throw new Error('Invalid date format');
      }

      // Create timestamps for start and end times
      const [startHours, startMinutes] = startTime.split(':').map(Number);
      const [endHours, endMinutes] = endTime.split(':').map(Number);

      // Create date objects with the correct time
      const startDateTime = new Date(bookingDate);
      const endDateTime = new Date(bookingDate);

      // Set hours directly without UTC conversion
      startDateTime.setHours(startHours, startMinutes, 0, 0);
      endDateTime.setHours(endHours, endMinutes, 0, 0);

      // Debug log
      console.log('Time components:', {
        bookingDate: bookingDate.toISOString(),
        requestedTime: {
          start: `${startHours}:${startMinutes}`,
          end: `${endHours}:${endMinutes}`
        },
        actualTime: {
          start: startDateTime.toISOString(),
          end: endDateTime.toISOString(),
          startHours: startDateTime.getHours(),
          endHours: endDateTime.getHours()
        }
      });

      // Validate that end time is after start time
      if (endDateTime <= startDateTime) {
        throw new Error('End time must be after start time');
      }

      const bookingData = {
        slot_id: selectedSlot.id,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        vehicle_number: formData.vehicleNumber,
      };

      // Debug log to verify the data
      console.log('Booking Data to be saved:', bookingData);

      const savedBooking = await saveBooking(bookingData);
      
      const bookingForRedux = {
        ...savedBooking,
        park: singlePark,
        userName: user ? user.name : "",
        email: formData.email,
      };

      dispatch(addBooking(bookingForRedux));
      dispatch(clearBookings());
      navigate("/mybookings");
    } catch (error) {
      console.error('Error saving booking:', error);
      alert(`Failed to save booking: ${error.message}`);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCancel = () => {
    dispatch(clearBookings());
    navigate("/");
  };

  if (isLoading) {
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
            <FaCheckCircle className="text-white text-2xl" />
          </div>
          <span className="text-xl font-semibold text-gray-700">
            Preparing your booking...
          </span>
        </motion.div>
      </div>
    );
  }

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
        <motion.div 
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Page Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
            >
              <FaCheckCircle className="text-white text-3xl" />
            </motion.div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Confirm Your Booking
            </h1>
            <p className="text-gray-600 text-lg">Review your details and complete the booking</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* User Details Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <AnimatedCard className="h-full">
                <div className="p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                      <FaUser className="text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">Your Details</h3>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">
                        Email Address
                      </label>
                      <InputField
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder="Enter your email"
                        disabled={user}
                      />
                      <AnimatePresence>
                        {errors.email && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="text-red-500 mt-2 text-sm flex items-center space-x-1"
                          >
                            <span>⚠️</span>
                            <span>{errors.email}</span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div>
                      <label className="block text-gray-700 font-medium mb-2">
                        Vehicle Number
                      </label>
                      <InputField
                        type="text"
                        name="vehicleNumber"
                        value={formData.vehicleNumber}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                        placeholder="Enter your vehicle number"
                      />
                      <AnimatePresence>
                        {errors.vehicleNumber && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="text-red-500 mt-2 text-sm flex items-center space-x-1"
                          >
                            <span>⚠️</span>
                            <span>{errors.vehicleNumber}</span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </AnimatedCard>
            </motion.div>

            {/* Booking Summary */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <AnimatedCard className="h-full">
                <div className="p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                      <FaCreditCard className="text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">Booking Summary</h3>
                  </div>

                  <div className="space-y-6">
                    {/* Location */}
                    <div className="flex items-start space-x-3">
                      <FaMapMarkerAlt className="text-blue-500 mt-1" />
                      <div>
                        <p className="text-gray-600 text-sm">Location</p>
                        <p className="text-gray-900 font-semibold">{singlePark.name}</p>
                      </div>
                    </div>

                    {/* Date & Time */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-start space-x-3">
                        <FaCalendarAlt className="text-green-500 mt-1" />
                        <div>
                          <p className="text-gray-600 text-sm">Date</p>
                          <p className="text-gray-900 font-semibold">{bookingsDetails.date}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <FaClock className="text-purple-500 mt-1" />
                        <div>
                          <p className="text-gray-600 text-sm">Time</p>
                          <p className="text-gray-900 font-semibold">{bookingsDetails.timeRange}</p>
                        </div>
                      </div>
                    </div>

                    {/* Duration */}
                    <div className="flex items-start space-x-3">
                      <FaClock className="text-orange-500 mt-1" />
                      <div>
                        <p className="text-gray-600 text-sm">Duration</p>
                        <p className="text-gray-900 font-semibold">{bookingsDetails.duration} hour(s)</p>
                      </div>
                    </div>

                    {/* Price Breakdown */}
                    <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Rate per hour</span>
                        <span className="text-gray-900 font-medium">₹{singlePark.price_per_hour}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Duration</span>
                        <span className="text-gray-900 font-medium">{bookingsDetails.duration} hours</span>
                      </div>
                      <div className="border-t border-gray-200 pt-3">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-semibold text-gray-900">Total Amount</span>
                          <span className="text-2xl font-bold text-green-600">
                            ₹{singlePark.price_per_hour * bookingsDetails.duration}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col space-y-3 pt-4">
                      <ShimmerButton 
                        onClick={handleSubmit} 
                        className="w-full py-3 text-lg font-semibold"
                      >
                        <FaCheckCircle />
                        Confirm Booking
                      </ShimmerButton>
                      
                      <motion.button
                        onClick={handleCancel}
                        className="w-full py-3 px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-colors duration-300"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Cancel
                      </motion.button>
                    </div>
                  </div>
                </div>
              </AnimatedCard>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Confirmation;
