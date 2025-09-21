import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useMap } from "../../MapProvider";
import {
  setUserLocation,
  setSinglePark,
  setDistance,
  setDuration,
} from "../../features/bookings/bookingsSlice";
import { fetchParkingData } from "../../features/bookings/parkingSlice";
import {
  GoogleMap,
  Marker,
  Circle,
  DirectionsRenderer,
  InfoWindow,
} from "@react-google-maps/api";
import { useSelector } from "react-redux";
import { flag } from "../../assets";
import { Loader } from "../index";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';

const MobileMap = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoaded } = useMap();
  const [directions, setDirections] = useState(null);
  const [userCity, setUserCity] = useState(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [selectedPark, setSelectedPark] = useState(null);
  const [showInfoWindow, setShowInfoWindow] = useState(false);
  const [isFindingNearest, setIsFindingNearest] = useState(false);

  const { userLocation, singlePark, distance, duration } = useSelector(
    (state) => state.bookings
  );

  const mapRef = useRef();
  const { itParks, cities, loading } = useSelector((state) => state.parking);

  // Fetch parking data when component mounts
  useEffect(() => {
    const loadParkingData = async () => {
      if (!dataLoaded) {
        await dispatch(fetchParkingData());
        setDataLoaded(true);
      }
    };
    loadParkingData();
  }, [dispatch, dataLoaded]);

  const center = useMemo(() => ({ lat: 12.9716, lng: 77.5946 }), []);
  const parks = useMemo(() => itParks, [itParks]);

  // Mobile-optimized map options
  const options = useMemo(
    () => ({
      styles: [
        {
          "featureType": "all",
          "elementType": "geometry",
          "stylers": [{ "lightness": 20 }]
        },
        {
          "featureType": "road",
          "elementType": "geometry",
          "stylers": [
            { "color": "#e4e4e4" },
            { "weight": 1.5 }
          ]
        },
        {
          "featureType": "road",
          "elementType": "labels.text",
          "stylers": [
            { "color": "#333333" },
            { "weight": 0.5 }
          ]
        },
        {
          "featureType": "water",
          "elementType": "geometry",
          "stylers": [{ "color": "#e9f5f8" }]
        },
        {
          "featureType": "landscape",
          "elementType": "geometry",
          "stylers": [{ "color": "#f5f5f5" }]
        },
        {
          "featureType": "poi",
          "elementType": "labels",
          "stylers": [{ "visibility": "off" }]
        }
      ],
      disableDefaultUI: true,
      clickableIcons: false,
      backgroundColor: '#f5f5f5',
      gestureHandling: 'greedy', // Better touch handling on mobile
      zoomControl: true,
      mapTypeControl: false,
      scaleControl: false,
      streetViewControl: false,
      rotateControl: false,
      fullscreenControl: false,
    }),
    []
  );

  // Circle options for better mobile visibility
  const updatedCloseOptions = {
    fillColor: "#3B82F6",
    fillOpacity: 0.1,
    strokeColor: "#3B82F6",
    strokeOpacity: 0.3,
    strokeWeight: 2,
  };

  const updatedMiddleOptions = {
    fillColor: "#3B82F6",
    fillOpacity: 0.05,
    strokeColor: "#3B82F6",
    strokeOpacity: 0.2,
    strokeWeight: 1,
  };

  const updatedFarOptions = {
    fillColor: "#3B82F6",
    fillOpacity: 0.02,
    strokeColor: "#3B82F6",
    strokeOpacity: 0.1,
    strokeWeight: 1,
  };

  const onLoad = useCallback((map) => (mapRef.current = map), []);

  // Find nearest parking function
  const findNearestPark = (userLocation, parks) => {
    if (!userLocation || !parks.length) return null;
    
    return parks.reduce((nearest, park) => {
      const distance = google.maps.geometry.spherical.computeDistanceBetween(
        new google.maps.LatLng(userLocation.lat, userLocation.lng),
        new google.maps.LatLng(park.latitude, park.longitude)
      );
      
      if (!nearest || distance < nearest.distance) {
        return { park, distance };
      }
      return nearest;
    }, null)?.park;
  };

  // Get current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          dispatch(setUserLocation(pos));
          mapRef.current?.panTo(pos);
        },
        (error) => {
          console.error("Error getting current location:", error);
          toast.error("Unable to get your location");
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  };

  // Initialize map and get current location
  useEffect(() => {
    const initializeMap = async () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const pos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            dispatch(setUserLocation(pos));
            mapRef.current?.panTo(pos);
            
            // Find and show nearest parking automatically
            if (parks.length > 0) {
              setIsFindingNearest(true);
              setTimeout(() => {
                const nearestPark = findNearestPark(pos, parks);
                if (nearestPark) {
                  // Auto-select the nearest parking and show directions
                  handleParkClick(nearestPark);
                  // Show a toast notification
                  toast.success(`Found nearest parking: ${nearestPark.name || nearestPark.address}`);
                }
                setIsFindingNearest(false);
              }, 1000); // Small delay to show loading state
            }
          },
          (error) => {
            console.error("Error getting current location:", error);
            toast.error("Unable to get your location");
          }
        );
      } else {
        toast.error("Geolocation is not supported by your browser");
      }
    };

    initializeMap();
  }, [parks]); // Add parks as dependency

  // Handle parking marker click
  const handleParkClick = (park) => {
    setSelectedPark(park);
    setShowInfoWindow(true);
    
    // Clear previous directions
    setDirections(null);
    
    // Pan to the selected park
    mapRef.current?.panTo({ lat: park.latitude, lng: park.longitude });
    
    // Calculate distance, duration, and directions
    if (userLocation) {
      const service = new google.maps.DirectionsService();
      service.route(
        {
          origin: userLocation,
          destination: { lat: park.latitude, lng: park.longitude },
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === "OK" && result) {
            setDirections(result);
            dispatch(setSinglePark(park));
            dispatch(setDistance(result.routes[0].legs[0].distance));
            dispatch(setDuration(result.routes[0].legs[0].duration.text));
            
            // Fit the map to show the entire route
            const bounds = new google.maps.LatLngBounds();
            result.routes[0].legs[0].steps.forEach((step) => {
              bounds.extend(step.start_location);
              bounds.extend(step.end_location);
            });
            mapRef.current?.fitBounds(bounds);
          }
        }
      );
    }
  };

  // Handle booking navigation
  const handleBookNow = () => {
    if (selectedPark) {
      navigate(`/listbookings/${selectedPark.id}`);
    }
  };

  // Custom marker icon for parking spots
  const parkingIcon = {
    url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
      <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="18" fill="#3B82F6" stroke="#ffffff" stroke-width="3"/>
        <text x="20" y="26" text-anchor="middle" fill="white" font-family="Arial" font-size="16" font-weight="bold">P</text>
      </svg>
    `),
    scaledSize: new google.maps.Size(40, 40),
    anchor: new google.maps.Point(20, 20),
  };

  if (!isLoaded || loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      {/* Loading overlay for finding nearest parking */}
      {isFindingNearest && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-40">
          <motion.div 
            className="bg-white/95 backdrop-blur-md rounded-full px-4 py-2 shadow-lg border border-white/30"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="flex items-center space-x-2">
              <motion.div
                className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <span className="text-sm font-medium text-gray-700">Finding nearest parking...</span>
            </div>
          </motion.div>
        </div>
      )}
      
      <GoogleMap
        zoom={12}
        center={center}
        mapContainerClassName="w-full h-full"
        options={options}
        onLoad={onLoad}
      >
        {/* Directions Route */}
        {directions && (
          <DirectionsRenderer
            directions={directions}
            key={directions.routes[0].legs[0].duration.value}
            options={{
              polylineOptions: {
                zIndex: 50,
                strokeColor: "#3B82F6",
                strokeWeight: 4,
                strokeOpacity: 0.8,
              },
              suppressMarkers: false,
            }}
          />
        )}

        {userLocation && (
          <>
            {/* User location marker */}
            <Marker 
              position={userLocation} 
              icon={flag}
              title="Your Location"
            />
            
            {/* Parking markers */}
            {parks.map((park) => (
              <Marker
                key={park.id}
                position={{ lat: park.latitude, lng: park.longitude }}
                icon={parkingIcon}
                onClick={() => handleParkClick(park)}
                title={park.name || park.address}
              />
            ))}
            
            {/* Distance circles - only show when no directions */}
            {!directions && (
              <>
                <Circle
                  center={userLocation}
                  radius={15000}
                  options={updatedCloseOptions}
                />
                <Circle
                  center={userLocation}
                  radius={30000}
                  options={updatedMiddleOptions}
                />
                <Circle
                  center={userLocation}
                  radius={45000}
                  options={updatedFarOptions}
                />
              </>
            )}
          </>
        )}

        {/* Info Window for selected parking */}
        {selectedPark && showInfoWindow && (
          <InfoWindow
            position={{ lat: selectedPark.latitude, lng: selectedPark.longitude }}
            onCloseClick={() => setShowInfoWindow(false)}
            options={{
              maxWidth: 300,
              pixelOffset: new google.maps.Size(0, -10),
            }}
          >
            <motion.div 
              className="p-0 w-[280px] max-w-[85vw] overflow-hidden"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              {/* Header with image */}
              <div className="relative">
                <img
                  src={selectedPark.image_url}
                  alt={selectedPark.name || selectedPark.address}
                  className="w-full h-32 object-cover rounded-t-lg"
                />
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-gray-900 px-2 py-1 rounded-full text-xs font-semibold shadow-lg max-w-[80px] truncate">
                  ₹{selectedPark.price_per_hour}/hr
                </div>
                <div className="absolute top-3 right-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                  Available
                </div>
              </div>
              
              {/* Content */}
              <div className="p-3 space-y-2 overflow-hidden">
                <div className="overflow-hidden">
                  <h3 className="font-bold text-gray-900 text-sm mb-1 truncate">
                    {selectedPark.name || selectedPark.address}
                  </h3>
                  <p className="text-xs text-gray-600 truncate">
                    {selectedPark.address}
                  </p>
                </div>
                
                {/* Compact info layout */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between min-w-0">
                    <div className="flex items-center space-x-1 min-w-0 flex-1">
                      <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-2.5 h-2.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <span className="text-xs text-gray-500 truncate">Basements:</span>
                    </div>
                    <span className="text-xs font-semibold text-blue-600 flex-shrink-0 ml-1">{selectedPark.basement_total || 1}</span>
                  </div>
                  
                  {distance && (
                    <div className="flex items-center justify-between min-w-0">
                      <div className="flex items-center space-x-1 min-w-0 flex-1">
                        <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <svg className="w-2.5 h-2.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <span className="text-xs text-gray-500 truncate">Distance:</span>
                      </div>
                      <span className="text-xs font-semibold text-green-600 flex-shrink-0 ml-1 truncate max-w-[80px]">{distance.text}</span>
                    </div>
                  )}
                  
                  {duration && (
                    <div className="flex items-center justify-between min-w-0">
                      <div className="flex items-center space-x-1 min-w-0 flex-1">
                        <div className="w-5 h-5 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <svg className="w-2.5 h-2.5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <span className="text-xs text-gray-500 truncate">Duration:</span>
                      </div>
                      <span className="text-xs font-semibold text-purple-600 flex-shrink-0 ml-1">{duration}</span>
                    </div>
                  )}
                </div>
                
                {/* Action buttons */}
                <div className="flex space-x-2 pt-1">
                  <motion.button
                    onClick={() => setShowInfoWindow(false)}
                    className="flex-1 bg-gray-100 text-gray-700 py-2 px-2 rounded-lg font-medium text-xs hover:bg-gray-200 transition-colors duration-200 min-w-0"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Close
                  </motion.button>
                  <motion.button
                    onClick={handleBookNow}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-2 rounded-lg font-semibold text-xs shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 min-w-0"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Book Now
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
};

export default MobileMap;
