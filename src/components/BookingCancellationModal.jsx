import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaExclamationTriangle, FaClock, FaCreditCard, FaRupeeSign } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { supabase } from '../lib/supabase';
import { formatIST, formatISTTime, calculateDurationMinutes } from '../utils/timeUtils';

const BookingCancellationModal = ({ booking, isOpen, onClose, onCancel }) => {
  const [isCancelling, setIsCancelling] = useState(false);
  const [currentCost, setCurrentCost] = useState(null);
  const [billingInfo, setBillingInfo] = useState(null);
  const [loadingCost, setLoadingCost] = useState(true);

  // Fetch real-time billing information when modal opens
  useEffect(() => {
    if (isOpen && booking) {
      fetchCurrentBilling();
    }
  }, [isOpen, booking]);

  const fetchCurrentBilling = async () => {
    try {
      setLoadingCost(true);
      
      // Get current billing cost
      const { data: costData, error: costError } = await supabase.rpc('get_active_booking_cost', {
        p_booking_id: booking.id
      });

      if (costError) throw costError;

      // Get detailed billing breakdown
      const { data: billingData, error: billingError } = await supabase.rpc('calculate_booking_billing', {
        p_booking_id: booking.id,
        p_end_time: new Date().toISOString()
      });

      if (billingError) throw billingError;

      setCurrentCost(costData?.[0] || null);
      setBillingInfo(billingData?.[0] || null);
    } catch (error) {
      console.error('Error fetching billing info:', error);
      toast.error('Failed to load billing information');
    } finally {
      setLoadingCost(false);
    }
  };

  const handleCancel = async () => {
    setIsCancelling(true);
    try {
      await onCancel(booking.id);
      onClose();
      toast.success('Booking cancelled successfully');
    } catch (error) {
      toast.error('Failed to cancel booking');
      console.error('Cancellation error:', error);
    } finally {
      setIsCancelling(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <FaExclamationTriangle className="text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Cancel Booking</h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FaTimes className="text-xl" />
            </button>
          </div>

          {/* Booking Details */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Location:</span>
                <span className="font-medium">{booking.parking_slots?.it_parks?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Slot:</span>
                <span className="font-medium">{booking.parking_slots?.slot_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Vehicle:</span>
                <span className="font-medium">{booking.vehicle_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Booking Time:</span>
                <span className="font-medium">
                  {formatIST(booking.billing_start_time || booking.start_time)}
                </span>
              </div>
            </div>
          </div>

          {/* Billing Information */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <div className="flex items-start space-x-3">
              <FaCreditCard className="text-yellow-600 mt-1" />
              <div className="flex-1">
                <h4 className="font-medium text-yellow-800 mb-2">Billing Information</h4>
                
                {loadingCost ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm text-yellow-700">Calculating current cost...</p>
                  </div>
                ) : currentCost && billingInfo ? (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-yellow-700">Current Cost:</span>
                      <span className="text-lg font-bold text-yellow-800 flex items-center">
                        <FaRupeeSign className="mr-1" />
                        {currentCost.current_cost?.toFixed(2) || '0.00'}
                      </span>
                    </div>
                    
                    <div className="text-xs text-yellow-600 space-y-1">
                      <div className="flex justify-between">
                        <span>Duration:</span>
                        <span>{Math.floor(currentCost.billing_minutes / 60)}h {currentCost.billing_minutes % 60}m</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Rate:</span>
                        <span>₹{billingInfo.rate_per_minute?.toFixed(2)}/min</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Billable Time:</span>
                        <span>{billingInfo.billable_minutes} minutes</span>
                      </div>
                    </div>
                    
                    <p className="text-xs text-yellow-700 mt-2">
                      Billing started at {formatIST(booking.billing_start_time || booking.start_time)}
                      <br />
                      <span className="text-yellow-600">
                        Total duration: {calculateDurationMinutes(booking.billing_start_time || booking.start_time, new Date())} minutes
                      </span>
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-yellow-700">
                    You will be charged for the time from when you made the booking until now.
                    The billing started immediately when you confirmed the booking.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <FaExclamationTriangle className="text-red-600 mt-1" />
              <div>
                <h4 className="font-medium text-red-800 mb-1">Important Notice</h4>
                <p className="text-sm text-red-700">
                  Cancelling this booking will end the billing cycle. You will be charged for the exact time 
                  elapsed since booking confirmation. The amount shown above is your current bill.
                </p>
                {currentCost && (
                  <p className="text-xs text-red-600 mt-1">
                    Final amount will be calculated at the moment of cancellation.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
            >
              Keep Booking
            </button>
            <button
              onClick={handleCancel}
              disabled={isCancelling}
              className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
            >
              {isCancelling ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Cancelling...</span>
                </>
              ) : (
                <>
                  <FaTimes />
                  <span>Cancel Booking</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default BookingCancellationModal;
