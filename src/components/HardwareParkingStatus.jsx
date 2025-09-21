import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCar, FaClock, FaMapMarkerAlt, FaCreditCard, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

const HardwareParkingStatus = ({ booking, park }) => {
  const [currentCost, setCurrentCost] = useState(0);
  const [parkingDuration, setParkingDuration] = useState(0);
  const [status, setStatus] = useState('reserved'); // reserved, active, completed
  const [hardwareStatus, setHardwareStatus] = useState({
    entryDetected: false,
    exitDetected: false,
    lastUpdate: null
  });

  // Simulate real-time updates (replace with actual WebSocket/API calls)
  useEffect(() => {
    if (status === 'active') {
      const interval = setInterval(() => {
        updateParkingStatus();
      }, 60000); // Update every minute

      return () => clearInterval(interval);
    }
  }, [status]);

  const updateParkingStatus = async () => {
    try {
      // This would be replaced with actual API call
      const response = await fetch(`/api/bookings/${booking.id}/status`);
      const data = await response.json();
      
      setCurrentCost(data.currentCost || 0);
      setParkingDuration(data.duration || 0);
      setHardwareStatus(data.hardwareStatus || hardwareStatus);
      
      if (data.hardwareStatus?.exitDetected) {
        setStatus('completed');
      } else if (data.hardwareStatus?.entryDetected) {
        setStatus('active');
      }
    } catch (error) {
      console.error('Error updating parking status:', error);
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'reserved': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'active': return 'bg-green-100 border-green-300 text-green-800';
      case 'completed': return 'bg-blue-100 border-blue-300 text-blue-800';
      default: return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'reserved': return <FaClock className="text-yellow-600" />;
      case 'active': return <FaCar className="text-green-600" />;
      case 'completed': return <FaCheckCircle className="text-blue-600" />;
      default: return <FaExclamationTriangle className="text-gray-600" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'reserved': return 'Waiting for arrival';
      case 'active': return 'Currently parking';
      case 'completed': return 'Parking completed';
      default: return 'Unknown status';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg p-6 space-y-6"
    >
      {/* Status Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {getStatusIcon()}
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Parking Status</h3>
            <p className="text-sm text-gray-600">{getStatusText()}</p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full border text-sm font-medium ${getStatusColor()}`}>
          {status.toUpperCase()}
        </div>
      </div>

      {/* Location Info */}
      <div className="flex items-start space-x-3">
        <FaMapMarkerAlt className="text-blue-500 mt-1" />
        <div>
          <p className="text-gray-600 text-sm">Location</p>
          <p className="text-gray-900 font-semibold">{park?.name}</p>
          <p className="text-gray-500 text-xs">Slot: {booking.slot_number}</p>
        </div>
      </div>

      {/* Hardware Status */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
        <h4 className="font-medium text-gray-900">Hardware Detection</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${hardwareStatus.entryDetected ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <span className="text-sm text-gray-600">Entry Detected</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${hardwareStatus.exitDetected ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <span className="text-sm text-gray-600">Exit Detected</span>
          </div>
        </div>
        {hardwareStatus.lastUpdate && (
          <p className="text-xs text-gray-500">
            Last update: {new Date(hardwareStatus.lastUpdate).toLocaleTimeString()}
          </p>
        )}
      </div>

      {/* Real-time Cost (only show when active) */}
      <AnimatePresence>
        {status === 'active' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-green-50 border border-green-200 rounded-lg p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-800 font-medium">Current Cost</p>
                <p className="text-green-600 text-sm">
                  {Math.floor(parkingDuration / 60)}h {parkingDuration % 60}m
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-600">₹{currentCost.toFixed(2)}</p>
                <p className="text-green-600 text-xs">Live billing</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Final Cost (only show when completed) */}
      <AnimatePresence>
        {status === 'completed' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-blue-50 border border-blue-200 rounded-lg p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-800 font-medium">Final Amount</p>
                <p className="text-blue-600 text-sm">
                  {Math.floor(parkingDuration / 60)}h {parkingDuration % 60}m total
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-600">₹{currentCost.toFixed(2)}</p>
                <p className="text-blue-600 text-xs">Payment required</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rate Information */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm">Rate per minute</p>
            <p className="text-gray-900 font-medium">₹{(park?.price_per_hour / 60).toFixed(2)}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-600 text-sm">Minimum billing</p>
            <p className="text-gray-900 font-medium">15 minutes</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default HardwareParkingStatus;
