import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  setSinglePark,
  setDistance,
  setDuration,
} from "../../features/bookings/bookingsSlice";
import { ParkCard } from "../index";
import styles from "../../style";
import { motion } from "framer-motion";

const ParksGrid = ({ userCity }) => {
  const dispatch = useDispatch();
  const [parkDistances, setParkDistances] = useState({});
  const [parkDuration, setParkDuration] = useState({});

  const { itParks, selectedComplex, priceSort, distanceFilter } = useSelector(
    (state) => state.parking
  );
  const { userLocation } = useSelector((state) => state.bookings);

  const parks = useSelector(state => state.parking.itParks);
  
  console.log('ParksGrid render:', {
    userCity,
    totalParks: parks.length,
    parks
  });

  useEffect(() => {
    console.log('Sample park data:', {
      firstPark: parks[0],
      userCity,
      cityMatch: parks[0]?.cities?.name?.toLowerCase() === userCity.toLowerCase()
    });
  }, [parks, userCity]);

  const filteredParks = parks.filter(park => 
    park.cities.name.toLowerCase() === userCity.toLowerCase()
  );

  console.log('Filtered parks:', filteredParks);

  if (filteredParks.length === 0) {
    return <div>Service will start soon....</div>;
  }

  const filteredItParks = selectedComplex
    ? filteredParks.filter((itPark) => itPark.complex === selectedComplex)
    : filteredParks;

  const filteredByDistance = filteredItParks.filter((itPark) => {
    const distanceValue = parkDistances[itPark.id]?.value || 0;
    switch (distanceFilter) {
      case "0-5 km":
        return distanceValue >= 0 && distanceValue <= 5000;
      case "5-10 km":
        return distanceValue > 5000 && distanceValue <= 10000;
      case "> 10 km":
        return distanceValue > 10000;
      default:
        return true;
    }
  });

  const sortedParks = filteredByDistance.sort((a, b) => {
    if (priceSort === "low") {
      return a.price_per_hour - b.price_per_hour;
    } else if (priceSort === "high") {
      return b.price_per_hour - a.price_per_hour;
    }
    return 0;
  });

  useEffect(() => {
    if (parks.length > 0 && userLocation) {
      filteredParks.forEach((park) => {
        fetchDirections(userLocation, park);
      });
    }
  }, [parks, userLocation, filteredParks]);

  const fetchDirections = (userLocation, park) => {
    if (!userLocation) return;
    const service = new google.maps.DirectionsService();
    service.route(
      {
        origin: userLocation,
        destination: { lat: park.latitude, lng: park.longitude },
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === "OK" && result) {
          const distance = result.routes[0].legs[0].distance;
          const duration = result.routes[0].legs[0].duration.text;

          setParkDistances((prev) => ({
            ...prev,
            [park.id]: distance,
          }));

          setParkDuration((prev) => ({
            ...prev,
            [park.id]: duration,
          }));
        } else {
          console.error("Error fetching directions:", status);
        }
      }
    );
  };

  const handleParkClick = (itPark) => {
    dispatch(setSinglePark(itPark));
    const distanceData = parkDistances[itPark.id];
    dispatch(setDistance(distanceData));
    dispatch(setDuration(parkDuration[itPark.id]));
  };

  return (
    <div className="w-full">

      {/* Parks Grid */}
      <motion.div 
        className="px-6 pb-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        {sortedParks.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {sortedParks.map((itPark, index) => (
              <ParkCard
                key={itPark.id}
                park={itPark}
                distance={parkDistances[itPark.id]?.text || "Calculating..."}
                duration={parkDuration[itPark.id] || "calculating"}
                onClick={() => handleParkClick(itPark)}
                containerClassName="w-full"
                imageClassName="h-48 object-cover"
                index={index}
              />
            ))}
          </div>
        ) : (
          <motion.div 
            className={`text-gray-600 h-96 ${styles.flexCenter} flex-col`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-4"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </motion.div>
            <h3 className="text-xl font-semibold mb-2">Service Starting Soon</h3>
            <p className="text-gray-500">We're working hard to bring you the best parking experience</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default ParksGrid;
