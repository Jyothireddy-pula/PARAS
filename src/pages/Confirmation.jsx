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
import { FaCheckCircle, FaCalendarAlt, FaClock, FaMapMarkerAlt, FaCreditCard, FaUser, FaCar } from "react-icons/fa";

const Confirmation = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const user = useSelector((state) => state.auth.user) || null;
 
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
 
  useEffect(() => {
    if (user && !formData.vehicleNumber) {
      setFormData(prev => ({
        ...prev,
        email: user.email || "",
        vehicleNumber: user.vehicleNumber || "",
      }));
    }
  }, [user]); 

  useEffect(() => { 
    setTimeout(() => {
      setIsLoading(false);
    }, 800);
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

    setIsSubmitting(true);
    try { 
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('No authenticated user found');
      }
 
      if (!bookingsDetails.startTime) {
        throw new Error('Start time is required');
      }

      const startTime = bookingsDetails.startTime;
       
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(startTime)) {
        throw new Error('Invalid time format. Please use HH:MM format (24-hour)');
      }

      
      if (!bookingsDetails.date) {
        throw new Error('Booking date is required');
      }
      
      
      const startDateTime = new Date();
      
      
      console.log('Hardware-based booking time:', {
        currentTime: startDateTime.toISOString(),
        billingStartsNow: true
      });

      
      const endDateTime = new Date(startDateTime);
      endDateTime.setHours(startDateTime.getHours() + 24);

      
      console.log('Hardware-based booking components:', {
        currentTime: startDateTime.toISOString(),
        requestedTime: {
          start: startTime
        },
        actualTime: {
          start: startDateTime.toISOString(),
          end: endDateTime.toISOString(),
          startHours: startDateTime.getHours()
        }
      });

      const bookingData = {
        slot_id: selectedSlot.id,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),  
        vehicle_number: formData.vehicleNumber,
        booking_type: 'hardware_based',
        hardware_entry_detected: false,
        hardware_exit_detected: false,
        billing_started: true, 
        billing_start_time: new Date().toISOString(), 
      };

       
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
      
       
      setIsSuccess(true);
      
      
      setTimeout(() => {
        navigate("/mybookings");
      }, 1500);
    } catch (error) {
      console.error('Error saving booking:', error);
      alert(`Failed to save booking: ${error.message}`);
      setIsSubmitting(false);
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
      <div className="min-h-screen bg-blue-50 flex items-center justify-center relative overflow-hidden">
        <FloatingElements />
        <motion.div 
          className="text-center z-10"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <span className="text-xl font-semibold text-gray-700">
            Preparing your booking...
          </span>
        </motion.div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center relative overflow-hidden">
        <FloatingElements />
        <motion.div 
          className="text-center z-10"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div 
            className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <FaCheckCircle className="text-white text-3xl" />
          </motion.div>
          <motion.h1 
            className="text-3xl font-bold text-gray-900 mb-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Booking Confirmed! 🎉
          </motion.h1>
          <motion.p 
            className="text-gray-600 text-lg mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            Your parking slot has been reserved successfully
          </motion.p>
          <motion.div 
            className="flex items-center justify-center space-x-2 text-gray-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
            <span>Redirecting to your bookings...</span>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50 relative overflow-hidden">
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
              className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
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
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
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
                    <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
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
                          <p className="text-gray-600 text-sm">Expected Arrival</p>
                          <p className="text-gray-900 font-semibold">{bookingsDetails.startTime}</p>
                        </div>
                      </div>
                    </div>

                    {/* Hardware-based booking info */}
                    <div className="flex items-start space-x-3">
                      <FaCar className="text-blue-500 mt-1" />
                      <div>
                        <p className="text-gray-600 text-sm">Billing Method</p>
                        <p className="text-gray-900 font-semibold">Pay per minute (Hardware detected)</p>
                        <p className="text-gray-500 text-xs">Billing starts when you arrive</p>
                      </div>
                    </div>

                    {/* Price Breakdown */}
                    <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Rate per minute</span>
                        <span className="text-gray-900 font-medium">₹{(singlePark.price_per_hour / 60).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Billing Method</span>
                        <span className="text-gray-900 font-medium">Hardware detected</span>
                      </div>
                      <div className="border-t border-gray-200 pt-3">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-semibold text-gray-900">Billing Method</span>
                          <span className="text-2xl font-bold text-blue-600">
                            Auto-billing from booking
                          </span>
                        </div>
                        <p className="text-gray-500 text-sm mt-2">
                          Billing starts immediately when you confirm and continues until you leave or cancel
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col space-y-3 pt-4">
                      {isSubmitting ? (
                        <motion.button
                          disabled
                          className="w-full py-3 px-6 bg-green-500 text-white rounded-xl font-semibold flex items-center justify-center space-x-2"
                          initial={{ opacity: 0.8 }}
                          animate={{ opacity: 1 }}
                        >
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Processing Booking...</span>
                        </motion.button>
                      ) : (
                        <ShimmerButton 
                          onClick={handleSubmit} 
                          className="w-full py-3 text-lg font-semibold"
                        >
                          <FaCheckCircle />
                          Confirm Booking
                        </ShimmerButton>
                      )}
                      
                      <motion.button
                        onClick={handleCancel}
                        disabled={isSubmitting}
                        className={`w-full py-3 px-6 rounded-xl font-semibold transition-colors duration-300 ${
                          isSubmitting 
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        }`}
                        whileHover={!isSubmitting ? { scale: 1.02 } : {}}
                        whileTap={!isSubmitting ? { scale: 0.98 } : {}}
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
