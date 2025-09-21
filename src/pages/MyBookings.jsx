import { useEffect, useState } from "react";
import { supabase } from '../lib/supabase';
import { Loader } from "../components";
import { FaClock, FaCar, FaMapMarkerAlt, FaRegCalendarAlt, FaGift, FaCoins, FaTicketAlt, FaPercent } from 'react-icons/fa';
import { motion, AnimatePresence } from "framer-motion";
import FloatingElements from "../components/ui/FloatingElements";
import AnimatedCard from "../components/ui/AnimatedCard";
import AnimatedHeader from "../components/ui/AnimatedHeader";
import ShimmerButton from "../components/ui/ShimmerButton";

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rewardPoints, setRewardPoints] = useState(0);
  const [pointsToConvert, setPointsToConvert] = useState('');
  const [conversionError, setConversionError] = useState('');
  const [convertedCash, setConvertedCash] = useState(0);
  const [conversionMessage, setConversionMessage] = useState('');

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) throw userError;
        
        if (!user) {
          setError('No authenticated user found');
          return;
        }

        const { data: bookingsData, error: bookingsError } = await supabase
          .from('bookings')
          .select(`
            *,
            parking_slots (
              slot_number,
              basement_number,
              it_parks (
                name,
                address,
                price_per_hour
              )
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (bookingsError) throw bookingsError;

        setBookings(bookingsData || []);
        // Calculate total reward points (50 points per booking)
        setRewardPoints((bookingsData || []).length * 50);
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const handleConvertPoints = () => {
    const points = parseInt(pointsToConvert, 10);
    if (isNaN(points) || points <= 0 || points > rewardPoints) {
      setConversionError('Invalid points to convert');
      setConversionMessage('');
      return;
    }
    
    if (points < 100) {
      setConversionError('Minimum points required: 100');
      setConversionMessage('');
      return;
    }
    
    const cashEquivalent = Math.floor(points / 10);
    setConvertedCash(cashEquivalent);
    setRewardPoints(rewardPoints - points);
    setPointsToConvert('');
    setConversionError('');
    setConversionMessage(`You have converted ${points} points to ₹${cashEquivalent}.`);
  };

  // Calculate duration between start and end time
  const calculateDuration = (start, end) => {
    const startTime = new Date(start);
    const endTime = new Date(end);
    const duration = (endTime - startTime) / (1000 * 60 * 60); // Convert to hours
    return Math.round(duration * 10) / 10; // Round to 1 decimal place
  };

  // Calculate total price
  const calculatePrice = (start, end, pricePerHour) => {
    const duration = calculateDuration(start, end);
    return Math.round(duration * pricePerHour);
  };

  const handleRedeemPoints = (requiredPoints, rewardDescription) => {
    console.log(`Attempting to redeem: ${rewardDescription} with ${requiredPoints} points`);
    if (rewardPoints >= requiredPoints) {
      const redemptionCode = `CODE-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      setConversionMessage(`Redeemed ${rewardDescription}! Your code: ${redemptionCode}`);
      setRewardPoints(rewardPoints - requiredPoints);
      setConversionError('');
      console.log(`Redemption successful: ${redemptionCode}`);
    } else {
      setConversionError(`You need ${requiredPoints - rewardPoints} more points to redeem ${rewardDescription}.`);
      setConversionMessage('');
      console.log('Redemption failed: Not enough points');
    }
  };

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
            <FaCar className="text-white text-2xl" />
          </div>
          <span className="text-xl font-semibold text-gray-700">
            Loading your bookings...
          </span>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      <FloatingElements />
      
      <div className="container mx-auto px-4 py-8 pt-24 md:pt-8 relative z-10">
        {/* Page Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <FaCar className="text-white text-3xl" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">My Bookings</h1>
          <p className="text-gray-600 text-lg">Manage your parking reservations and rewards</p>
        </motion.div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-8 shadow-lg"
            >
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">!</span>
                </div>
                <span className="font-medium">{error}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bookings Section */}
        {bookings.length === 0 ? (
          <motion.div 
            className="text-center py-16"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaCar className="text-gray-400 text-3xl" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-700 mb-2">No Bookings Found</h3>
            <p className="text-gray-500 text-lg">You haven't made any parking reservations yet</p>
          </motion.div>
        ) : (
          <motion.div 
            className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {bookings.map((booking, index) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -8 }}
              >
                <AnimatedCard className="h-full">
                  <div className="p-6">
                    {/* Booking Header */}
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {booking.parking_slots?.it_parks?.name}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        booking.booking_status === 'active' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {booking.booking_status}
                      </span>
                    </div>

                    {/* Booking Details */}
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <FaMapMarkerAlt className="text-blue-600 text-sm" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Location</p>
                          <p className="text-gray-900 font-medium">{booking.parking_slots?.it_parks?.address}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <FaCar className="text-green-600 text-sm" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Vehicle & Slot</p>
                          <p className="text-gray-900 font-medium">
                            {booking.vehicle_number} | B{booking.parking_slots?.basement_number}-{booking.parking_slots?.slot_number}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <FaClock className="text-yellow-600 text-sm" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Duration</p>
                          <p className="text-gray-900 font-medium">{calculateDuration(booking.start_time, booking.end_time)} hours</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <FaRegCalendarAlt className="text-purple-600 text-sm" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Timing</p>
                          <p className="text-gray-900 font-medium text-sm">
                            {new Date(booking.start_time).toLocaleString()}
                          </p>
                          <p className="text-gray-900 font-medium text-sm">
                            {new Date(booking.end_time).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {/* Price Section */}
                      <div className="mt-6 pt-4 border-t border-gray-200">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 font-medium">Total Amount</span>
                          <span className="text-2xl font-bold text-green-600">
                            ₹{calculatePrice(
                              booking.start_time, 
                              booking.end_time, 
                              booking.parking_slots?.it_parks?.price_per_hour
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </AnimatedCard>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Rewards Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12"
        >
          <AnimatedCard>
            <div className="p-8">
              {/* Rewards Header */}
              <div className="flex items-center space-x-4 mb-8">
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                  <FaGift className="text-white text-xl" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Reward Points</h3>
                  <p className="text-gray-600">Earn points with every booking and redeem rewards</p>
                </div>
              </div>

              {/* Points Display */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FaCoins className="text-yellow-500 text-2xl" />
                    <div>
                      <p className="text-gray-600 text-sm">Total Points</p>
                      <p className="text-3xl font-bold text-gray-900">{rewardPoints}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-600 text-sm">Earned from</p>
                    <p className="text-lg font-semibold text-gray-900">{bookings.length} bookings</p>
                  </div>
                </div>
              </div>

              {/* Reward Options */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.button
                  onClick={() => handleRedeemPoints(5000, '1 free booking')}
                  className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 transition-all duration-300 hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={rewardPoints < 5000}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <FaTicketAlt className="text-2xl" />
                    <div>
                      <h4 className="font-bold text-lg">Free Booking</h4>
                      <p className="text-blue-100 text-sm">5000 points</p>
                    </div>
                  </div>
                  <p className="text-blue-100 text-sm">Get one completely free parking session</p>
                </motion.button>

                <motion.button
                  onClick={() => handleRedeemPoints(3000, '50% off')}
                  className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white p-6 transition-all duration-300 hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={rewardPoints < 3000}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <FaPercent className="text-2xl" />
                    <div>
                      <h4 className="font-bold text-lg">50% Off</h4>
                      <p className="text-green-100 text-sm">3000 points</p>
                    </div>
                  </div>
                  <p className="text-green-100 text-sm">Get 50% discount on your next booking</p>
                </motion.button>

                <motion.button
                  onClick={() => handleRedeemPoints(2000, '20% off')}
                  className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 text-white p-6 transition-all duration-300 hover:from-yellow-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={rewardPoints < 2000}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <FaPercent className="text-2xl" />
                    <div>
                      <h4 className="font-bold text-lg">20% Off</h4>
                      <p className="text-yellow-100 text-sm">2000 points</p>
                    </div>
                  </div>
                  <p className="text-yellow-100 text-sm">Get 20% discount on your next booking</p>
                </motion.button>
              </div>

              {/* Messages */}
              <AnimatePresence>
                {conversionError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center space-x-2"
                  >
                    <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">!</span>
                    </div>
                    <span className="font-medium">{conversionError}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {conversionMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center space-x-2"
                  >
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span className="font-medium">{conversionMessage}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </AnimatedCard>
        </motion.div>
      </div>
    </div>
  );
};

export default MyBookings;
