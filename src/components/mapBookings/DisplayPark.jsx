import { MdDirectionsCar, MdAccessTime, MdLocalParking, MdLocationOn } from 'react-icons/md';
import { FaRupeeSign, FaParking } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getSlotAvailability } from '../../utils/slotManagement';

export default function DisplayPark({ distance, duration, park, onNavigate }) {
  const navigate = useNavigate();
  const [slotAvailability, setSlotAvailability] = useState({
    available: 0,
    total: 0,
    loading: true,
    error: false
  });
  
  // Check slot availability when component mounts
  useEffect(() => {
    const checkAvailability = async () => {
      try {
        setSlotAvailability(prev => ({ ...prev, loading: true, error: false }));
        const slots = await getSlotAvailability(park.id);
        
        const available = slots.filter(slot => slot.status === 'Available').length;
        const total = slots.length;
        
        setSlotAvailability({
          available,
          total,
          loading: false,
          error: false
        });
      } catch (error) {
        console.error('Error checking slot availability:', error);
        setSlotAvailability(prev => ({
          ...prev,
          loading: false,
          error: true
        }));
      }
    };

    if (park?.id) {
      checkAvailability();
    }
  }, [park?.id]);
  
  if (!distance.text && !duration) return null;

  return (
    <div className="flex flex-col bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl shadow-2xl p-4 transform hover:scale-[1.02] transition-all duration-300 min-h-min">
      {/* Header with Image */}
      <div className="relative mb-4 rounded-lg overflow-hidden">
        <img 
          src={park.image_url} 
          alt={park.name}
          className="w-full h-40 object-cover"
        />
        <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-40 flex items-center justify-center">
          <h2 className="text-2xl font-bold text-white text-center px-4">{park.name}</h2>
        </div>
      </div>

      {/* Location Info */}
      <div className="flex items-start gap-2 mb-4 bg-gray-800 p-3 rounded-lg">
        <MdLocationOn className="text-red-400 text-xl flex-shrink-0 mt-1" />
        <p className="text-gray-300 text-sm">{park.address}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-gray-800 p-2 rounded-lg hover:bg-gray-750 transition-colors">
          <div className="flex items-center gap-2">
            <MdDirectionsCar className="text-blue-400 text-lg" />
            <p className="text-gray-400 text-xs">Distance</p>
          </div>
          <p className="text-white font-semibold ml-6 text-sm">{distance.text}</p>
        </div>

        <div className="bg-gray-800 p-2 rounded-lg hover:bg-gray-750 transition-colors">
          <div className="flex items-center gap-2">
            <MdAccessTime className="text-green-400 text-lg" />
            <p className="text-gray-400 text-xs">Duration</p>
          </div>
          <p className="text-white font-semibold ml-6 text-sm">{duration}</p>
        </div>

        <div className="bg-gray-800 p-2 rounded-lg hover:bg-gray-750 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FaParking className="text-yellow-400 text-lg" />
              <p className="text-gray-400 text-xs">Slots</p>
            </div>
            {!slotAvailability.loading && (
              <button
                onClick={async () => {
                  try {
                    setSlotAvailability(prev => ({ ...prev, loading: true, error: false }));
                    const slots = await getSlotAvailability(park.id);
                    const available = slots.filter(slot => slot.status === 'Available').length;
                    const total = slots.length;
                    setSlotAvailability({ available, total, loading: false, error: false });
                  } catch (error) {
                    setSlotAvailability(prev => ({ ...prev, loading: false, error: true }));
                  }
                }}
                className="text-yellow-400 hover:text-yellow-300 text-xs"
                title="Refresh availability"
              >
                ↻
              </button>
            )}
          </div>
          <div className="ml-6">
            {slotAvailability.loading ? (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-400 text-xs">Checking...</p>
              </div>
            ) : slotAvailability.error ? (
              <p className="text-red-400 text-xs">Error loading</p>
            ) : (
              <div>
                <p className="text-white font-semibold text-sm">
                  {slotAvailability.available > 0 ? `${slotAvailability.available} Available` : 'Not Available'}
                </p>
                <p className="text-gray-400 text-xs">
                  {slotAvailability.total} total slots
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-800 p-2 rounded-lg hover:bg-gray-750 transition-colors">
          <div className="flex items-center gap-2">
            <FaRupeeSign className="text-purple-400 text-lg" />
            <p className="text-gray-400 text-xs">Price/Minute</p>
          </div>
          <p className="text-white font-semibold ml-6 text-sm">₹{(park.price_per_hour / 60).toFixed(2)}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3 mt-auto">
        <button 
          onClick={() => navigate(`/listbookings/${park.id}`)}
          disabled={slotAvailability.loading || slotAvailability.available === 0}
          className={`py-2 px-3 rounded-lg transition-colors duration-300 font-medium flex items-center justify-center gap-2 text-sm ${
            slotAvailability.loading || slotAvailability.available === 0
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          <FaParking className="text-lg" />
          {slotAvailability.loading ? 'Checking...' : slotAvailability.available === 0 ? 'No Slots' : 'Book Now'}
        </button>
        <button 
          onClick={() => onNavigate(park)}
          className="bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded-lg transition-colors duration-300 font-medium flex items-center justify-center gap-2 text-sm"
        >
          <MdDirectionsCar className="text-lg" />
          Navigate
        </button>
      </div>
    </div>
  );
}
