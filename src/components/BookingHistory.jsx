import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const BookingHistory = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [parkingLots, setParkingLots] = useState([]);
  const [filters, setFilters] = useState({
    dateRange: 'all', // all, today, week, month
    status: 'all', // all, active, completed
    parkingLot: 'all'
  });

  useEffect(() => {
    fetchBookings();
  }, [filters]);

  const fetchBookings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log('No user found');
        setBookings([]);
        setLoading(false);
        return;
      }

      console.log('Fetching bookings for user:', user.id);

      let query = supabase
        .from('bookings')
        .select(`
          id,
          start_time,
          end_time,
          vehicle_number,
          booking_status,
          user_id,
          slot_id,
          parking_slots!inner (
            slot_number,
            basement_number,
            it_parks!inner (
              id,
              name,
              profile_id
            )
          )
        `)
        .eq('parking_slots.it_parks.profile_id', user.id);

      // Apply filters
      if (filters.dateRange !== 'all') {
        const now = new Date();
        let startDate = new Date();
        
        switch (filters.dateRange) {
          case 'today':
            startDate.setHours(0, 0, 0, 0);
            break;
          case 'week':
            startDate.setDate(now.getDate() - 7);
            break;
          case 'month':
            startDate.setMonth(now.getMonth() - 1);
            break;
        }
        
        query = query.gte('start_time', startDate.toISOString());
      }

      if (filters.status !== 'all') {
        query = query.eq('booking_status', filters.status);
      }

      if (filters.parkingLot !== 'all') {
        query = query.eq('parking_slots.it_parks.id', filters.parkingLot);
      }

      // Get bookings data
      const { data: bookingsData, error: bookingsError } = await query.order('start_time', { ascending: false });

      if (bookingsError) {
        console.error('Error fetching bookings:', bookingsError);
        throw bookingsError;
      }

      console.log('Raw bookings data:', bookingsData);

      if (!bookingsData || bookingsData.length === 0) {
        console.log('No bookings found - showing sample data');
        // Show sample data for demonstration
        const sampleData = [
          {
            id: 'sample-1',
            start_time: new Date().toISOString(),
            end_time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
            vehicle_number: 'KA-01-AB-1234',
            booking_status: 'active',
            user_id: 'sample-user',
            slot_id: 'sample-slot',
            parking_slots: {
              slot_number: 'A-01',
              basement_number: '1',
              it_parks: {
                id: 'sample-park',
                name: 'Sample IT Park',
                profile_id: user.id
              }
            },
            profile: {
              id: 'sample-user',
              full_name: 'John Doe',
              email: 'john.doe@example.com',
              phone_number: '+91 98765 43210'
            }
          }
        ];
        setBookings(sampleData);
        setParkingLots([{ id: 'sample-park', name: 'Sample IT Park' }]);
        setLoading(false);
        return;
      }

      // Fetch profiles data for each booking
      const userIds = [...new Set(bookingsData.map(booking => booking.user_id))];
      console.log('User IDs to fetch profiles for:', userIds);
      
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw profilesError;
      }

      console.log('Profiles data:', profilesData);

      // Combine bookings with profiles data
      const combinedData = bookingsData.map(booking => ({
        ...booking,
        profile: profilesData.find(profile => profile.id === booking.user_id)
      }));

      console.log('Combined data:', combinedData);

      // Remove duplicates from parking lots
      const uniqueParkingLots = Array.from(new Set(combinedData.map(
        booking => booking.parking_slots.it_parks.id
      ))).map(id => {
        const booking = combinedData.find(b => b.parking_slots.it_parks.id === id);
        return {
          id: booking.parking_slots.it_parks.id,
          name: booking.parking_slots.it_parks.name
        };
      });

      setParkingLots(uniqueParkingLots);
      setBookings(combinedData);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 text-lg">Loading booking history...</p>
        <p className="text-gray-400 text-sm mt-2">Please wait while we fetch your data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter Bookings</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">Time Range</label>
            <select
              className="bg-white border border-gray-300 text-gray-900 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filters.dateRange}
              onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              className="bg-white border border-gray-300 text-gray-900 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">Parking Lot</label>
            <select
              className="bg-white border border-gray-300 text-gray-900 px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filters.parkingLot}
              onChange={(e) => setFilters(prev => ({ ...prev, parkingLot: e.target.value }))}
            >
              <option value="all">All Parking Lots</option>
              {parkingLots.map(lot => (
                <option key={lot.id} value={lot.id}>{lot.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow-lg">
        <table className="w-full">
          <thead className="bg-blue-600">
            <tr>
              <th className="p-4 text-left text-white font-semibold">Parking Lot</th>
              <th className="p-4 text-left text-white font-semibold">Location</th>
              <th className="p-4 text-left text-white font-semibold">Vehicle</th>
              <th className="p-4 text-left text-white font-semibold">Customer</th>
              <th className="p-4 text-left text-white font-semibold">Contact</th>
              <th className="p-4 text-left text-white font-semibold">Start Time</th>
              <th className="p-4 text-left text-white font-semibold">End Time</th>
              <th className="p-4 text-left text-white font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {bookings.map((booking, index) => (
              <tr key={booking.id} className={`hover:bg-blue-50 transition-colors duration-200 ${
                index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
              }`}>
                <td className="p-4 text-gray-900 font-medium">
                  {booking.parking_slots?.it_parks?.name || 'N/A'}
                </td>
                <td className="p-4 text-gray-700">
                  {booking.parking_slots ? 
                    `Basement ${booking.parking_slots.basement_number}, Slot ${booking.parking_slots.slot_number}` : 
                    'N/A'
                  }
                </td>
                <td className="p-4 text-gray-900 font-mono text-sm">
                  {booking.vehicle_number || 'N/A'}
                </td>
                <td className="p-4 text-gray-900 font-medium">
                  {booking.profile?.full_name || 'N/A'}
                </td>
                <td className="p-4 text-gray-700">
                  <div className="space-y-1">
                    <div className="text-sm">{booking.profile?.phone_number || 'N/A'}</div>
                    <div className="text-xs text-gray-500">{booking.profile?.email || 'N/A'}</div>
                  </div>
                </td>
                <td className="p-4 text-gray-700 text-sm">
                  {booking.start_time ? formatDate(booking.start_time) : 'N/A'}
                </td>
                <td className="p-4 text-gray-700 text-sm">
                  {booking.end_time ? formatDate(booking.end_time) : 'N/A'}
                </td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    booking.booking_status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : booking.booking_status === 'completed'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {booking.booking_status || 'inactive'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {bookings.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-2">No bookings found</div>
            <div className="text-gray-400 text-sm">Try adjusting your filters or check back later</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingHistory; 