import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Button, InputField } from "../index";
import { setBookingDetails } from "../../features/bookings/bookingsSlice";
import { useCheckAvailability } from "../../hooks";
import { toast } from "react-toastify";
import { FaCar, FaClock, FaInfoCircle } from "react-icons/fa";

const BookingFilters = ({ singlePark }) => {
  const dispatch = useDispatch();
  const checkAvailability = useCheckAvailability();

  // Get current date and max date (7 days from now)
  const now = new Date();
  const maxDate = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000));
  
  // Format dates for input min/max attributes
  const formatDateForInput = (date) => {
    return date.toISOString().split('T')[0];
  };

  const [formData, setFormData] = useState({
    date: formatDateForInput(now),
    hour: now.getHours().toString(),
    customTime: "", // For custom time input
    useCustomTime: false, // Toggle between dropdown and custom input
    // Remove duration - hardware will determine actual duration
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Additional validation for date selection
    if (name === 'date') {
      const selectedDate = new Date(value);
      if (selectedDate > maxDate) {
        toast.error('Please select a date within the next 7 days');
        return;
      }
    }

    // Additional validation for hour selection
    if (name === 'hour') {
      const selectedDateTime = new Date(formData.date);
      selectedDateTime.setHours(parseInt(value), 0, 0, 0);
      
      if (selectedDateTime < now || selectedDateTime > maxDate) {
        toast.error('Please select a time within the next 7 days');
        return;
      }
    }

    const newFormData = {
      ...formData,
      [name]: value,
    };
    setFormData(newFormData);
  };

  const validateForm = () => {
    const { date, hour, customTime, useCustomTime } = formData;
    if (!date) {
      toast.error("Please select date");
      return false;
    }
    if (useCustomTime && !customTime) {
      toast.error("Please enter expected arrival time");
      return false;
    }
    if (!useCustomTime && !hour) {
      toast.error("Please select expected arrival time");
      return false;
    }
    return true;
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      // For hardware-based booking, we only need start time
      let startTime;
      
      if (formData.useCustomTime) {
        // Use custom time input
        startTime = formData.customTime;
      } else {
        // Use dropdown selection
        const startHour = parseInt(formData.hour);
        
        // Format hour for display
        const formatHour = (hour) => {
          const h = hour % 24;
          return h < 10 ? `0${h}:00` : `${h}:00`;
        };

        startTime = formatHour(startHour);
      }

      // Dispatch booking details for hardware-based booking
      dispatch(setBookingDetails({
        ...formData,
        startTime,
        bookingType: 'hardware_based' // Flag to indicate hardware-based booking
      }));
      
      await checkAvailability();
    } catch (error) {
      console.error("Booking error:", error);
      toast.error("Error processing booking");
    }
  };

  // Add this function to generate available time slots (24 hours for any selected date)
  const generateTimeSlots = () => {
    const selectedDate = new Date(formData.date);
    const slots = [];
    
    // Generate all 24 hours for the selected date
    for (let hour = 0; hour < 24; hour++) {
      slots.push(hour);
    }
    
    console.log('Generated slots:', slots); // Debug log
    return slots;
  };

  // Add useEffect to reset hour when date changes
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      hour: "", // Reset hour when date changes
      customTime: "" // Reset custom time when date changes
    }));
  }, [formData.date]);

  // Set current time as default when component mounts
  useEffect(() => {
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    setFormData(prev => ({
      ...prev,
      customTime: currentTime
    }));
  }, []);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
      {/* Hardware-based booking info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <FaInfoCircle className="text-blue-500 mt-1 flex-shrink-0" />
          <div>
            <h3 className="text-blue-800 font-semibold mb-2">Smart Parking System</h3>
            <p className="text-blue-700 text-sm">
              Billing starts immediately when you confirm your booking and continues until you leave or cancel. 
              You'll only pay for the actual time from booking confirmation to exit/cancellation.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleBooking} className="space-y-4">
        <div>
          <label className="block text-gray-700 mb-2 font-medium">
            <FaClock className="inline mr-2" />
            Select Date (Next 7 days)
          </label>
          <InputField
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            min={formatDateForInput(now)}
            max={formatDateForInput(maxDate)}
            className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-2 font-medium">
            <FaCar className="inline mr-2" />
            Expected Arrival Time
          </label>
          
          {/* Time Selection Toggle */}
          <div className="flex items-center space-x-4 mb-3">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="timeSelection"
                checked={!formData.useCustomTime}
                onChange={() => setFormData(prev => ({ ...prev, useCustomTime: false }))}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Quick Select</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="timeSelection"
                checked={formData.useCustomTime}
                onChange={() => setFormData(prev => ({ ...prev, useCustomTime: true }))}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Custom Time</span>
            </label>
          </div>

          {/* Quick Select Dropdown */}
          {!formData.useCustomTime && (
            <select
              name="hour"
              value={formData.hour}
              onChange={handleChange}
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
            >
              <option value="">Select Expected Arrival Time</option>
              {generateTimeSlots().map((hour) => (
                <option key={hour} value={hour}>
                  {hour < 10 ? `0${hour}:00` : `${hour}:00`}
                </option>
              ))}
            </select>
          )}

          {/* Custom Time Input */}
          {formData.useCustomTime && (
            <div className="space-y-2">
              <input
                type="time"
                name="customTime"
                value={formData.customTime}
                onChange={handleChange}
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                placeholder="HH:MM"
              />
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
                    setFormData(prev => ({ ...prev, customTime: currentTime }));
                  }}
                  className="text-xs text-blue-600 hover:text-blue-800 underline"
                >
                  Use Current Time
                </button>
                <span className="text-xs text-gray-500">•</span>
                <button
                  type="button"
                  onClick={() => {
                    const nextHour = now.getHours() + 1;
                    const nextTime = `${nextHour.toString().padStart(2, '0')}:00`;
                    setFormData(prev => ({ ...prev, customTime: nextTime }));
                  }}
                  className="text-xs text-blue-600 hover:text-blue-800 underline"
                >
                  Next Hour
                </button>
                <span className="text-xs text-gray-500">•</span>
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, customTime: "09:00" }));
                  }}
                  className="text-xs text-blue-600 hover:text-blue-800 underline"
                >
                  Morning (9 AM)
                </button>
                <span className="text-xs text-gray-500">•</span>
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, customTime: "18:00" }));
                  }}
                  className="text-xs text-blue-600 hover:text-blue-800 underline"
                >
                  Evening (6 PM)
                </button>
              </div>
            </div>
          )}
          
          <p className="text-gray-500 text-xs mt-1">
            This helps us prepare your slot. Actual billing starts when you arrive.
          </p>
        </div>

        {/* Pricing info */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-800 font-medium">Rate per minute</p>
              <p className="text-green-600 text-sm">Pay only for time used</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-600">
                ₹{singlePark?.price_per_hour ? (singlePark.price_per_hour / 60).toFixed(2) : '0.00'}
              </p>
              <p className="text-green-600 text-xs">per minute</p>
            </div>
          </div>
        </div>

        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors duration-300">
          <FaCar className="inline mr-2" />
          Reserve Parking Slot
        </Button>
      </form>
    </div>
  );
};

export default BookingFilters;
