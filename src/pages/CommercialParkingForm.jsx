import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, InputField } from "../components";
import styles from "../style";
import { fetchCities, createParking, createParkingSlots } from "../services/supabase";
import { toast } from 'react-toastify';
import { supabase } from '../lib/supabase';
import { getGeocode, getLatLng } from "use-places-autocomplete";

const CommercialParkingForm = () => {
  const navigate = useNavigate();
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city_id: "",
    type: "",
    number_of_slots: "",
    price_per_hour: "",
    contact_number: "",
    latitude: "",
    longitude: ""
  });

  useEffect(() => {
    const loadCities = async () => {
      try {
        const citiesData = await fetchCities();
        setCities(citiesData);
      } catch (error) {
        toast.error("Failed to load cities");
        console.error("Error loading cities:", error);
      }
    };
    loadCities();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLocationFetch = async () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      // Get address from coordinates using reverse geocoding
      const results = await getGeocode({
        location: { lat, lng }
      });

      if (results[0]) {
        setFormData(prev => ({
          ...prev,
          latitude: lat,
          longitude: lng,
          address: results[0].formatted_address
        }));
        toast.success("Location coordinates fetched successfully!");
      }
    } catch (error) {
      console.error("Error fetching location:", error);
      toast.error("Failed to fetch current location");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('You must be logged in to create parking');

      // Create IT park entry
      const parkData = await createParking({
        name: formData.name,
        city_id: parseInt(formData.city_id),
        address: formData.address,
        type: formData.type,
        available_spots: parseInt(formData.number_of_slots),
        price_per_hour: parseInt(formData.price_per_hour),
        profile_id: user.id,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude)
      });

      // Create parking slots
      const slotsToCreate = Array.from({ length: parseInt(formData.number_of_slots) }, (_, index) => ({
        park_id: parkData.id,
        basement_number: 'B1',
        slot_number: `B1-${index + 1}`,
        status: 'Available'
      }));

      await createParkingSlots(slotsToCreate);

      toast.success("Commercial parking added successfully!");
      navigate('/');
    } catch (error) {
      toast.error(error.message || "Failed to add parking space");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-50">
      <div className={`${styles.flexCenter} py-8`}>
        <div className="bg-white p-8 rounded-2xl max-w-2xl w-[90%] shadow-xl border border-gray-200">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              List Commercial Parking
            </h2>
            <p className="text-gray-600">
              Add your commercial parking space to our platform
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Parking Name *
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter commercial parking name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  City *
                </label>
                <select
                  name="city_id"
                  value={formData.city_id}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                >
                  <option value="">Select your city</option>
                  {cities.map(city => (
                    <option key={city.id} value={city.id}>
                      {city.name}, {city.state}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Complete Address *
              </label>
              <textarea
                name="address"
                placeholder="Enter complete address"
                value={formData.address}
                onChange={handleChange}
                required
                rows={3}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 resize-none"
              />
              {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Parking Type *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                >
                  <option value="">Select parking type</option>
                  <option value="IT Park">IT Park</option>
                  <option value="Mall">Mall</option>
                  <option value="Commercial Complex">Commercial Complex</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Number of Slots *
                </label>
                <input
                  type="number"
                  name="number_of_slots"
                  placeholder="Enter total number of parking slots"
                  value={formData.number_of_slots}
                  onChange={handleChange}
                  required
                  min="1"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                />
                {errors.number_of_slots && <p className="text-red-500 text-sm mt-1">{errors.number_of_slots}</p>}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Price per Minute (₹) *
                </label>
                <input
                  type="number"
                  name="price_per_hour"
                  placeholder="Enter price per minute in rupees"
                  value={formData.price_per_hour}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                />
                {errors.price_per_hour && <p className="text-red-500 text-sm mt-1">{errors.price_per_hour}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Contact Number *
                </label>
                <input
                  type="tel"
                  name="contact_number"
                  placeholder="Enter 10-digit contact number"
                  value={formData.contact_number}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                />
                {errors.contact_number && <p className="text-red-500 text-sm mt-1">{errors.contact_number}</p>}
              </div>
            </div>

            {/* Location Section */}
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Location Information
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Latitude
                  </label>
                  <input
                    type="text"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleChange}
                    readOnly
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-100 text-gray-600"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Longitude
                  </label>
                  <input
                    type="text"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleChange}
                    readOnly
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-100 text-gray-600"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleLocationFetch}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition-all duration-300 font-semibold flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Get Current Location
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-4 px-6 rounded-lg transition-all duration-300 font-semibold text-lg flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Adding Parking Space...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Submit Listing
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CommercialParkingForm;