import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const SlotManagement = () => {
  const [parkingData, setParkingData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchParkingSlots = async () => {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        
        // Fetch parking slots for the user's IT parks
        const { data: slots, error } = await supabase
          .from('parking_slots')
          .select(`
            id,
            basement_number,
            slot_number,
            status,
            park_id,
            it_parks!inner (
              id,
              name,
              profile_id
            )
          `)
          .eq('it_parks.profile_id', user.id)
          .order('basement_number', { ascending: true })
          .order('slot_number', { ascending: true });

        if (error) throw error;

        // Sort the data after fetching
        const sortedSlots = slots.sort((a, b) => 
          a.it_parks.name.localeCompare(b.it_parks.name)
        );

        // Organize slots by parking lot, then by basement
        const organizedData = sortedSlots.reduce((acc, slot) => {
          const parkId = slot.it_parks.id;
          const parkName = slot.it_parks.name;
          const basement = slot.basement_number || '1';

          if (!acc[parkId]) {
            acc[parkId] = {
              name: parkName,
              basements: {}
            };
          }
          
          if (!acc[parkId].basements[basement]) {
            acc[parkId].basements[basement] = [];
          }
          
          acc[parkId].basements[basement].push(slot);
          return acc;
        }, {});

        setParkingData(organizedData);
      } catch (error) {
        console.error('Error fetching parking slots:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchParkingSlots();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 text-lg">Loading parking slots...</p>
        <p className="text-gray-400 text-sm mt-2">Please wait while we fetch your data</p>
      </div>
    );
  }

  if (!parkingData || Object.keys(parkingData).length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg mb-2">No parking slots found</div>
        <div className="text-gray-400 text-sm">Add some parking slots to get started</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {Object.entries(parkingData).map(([parkId, parkInfo]) => (
        <div key={parkId} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-white text-2xl font-bold mb-2">
                  {parkInfo.name}
                </h2>
                <p className="text-blue-100 text-sm">
                  {Object.keys(parkInfo.basements).length} Basement{Object.keys(parkInfo.basements).length !== 1 ? 's' : ''} • {
                    Object.values(parkInfo.basements).flat().length
                  } Total Slots
                </p>
              </div>
              <div className="text-right">
                <div className="text-white text-3xl font-bold">
                  {Object.values(parkInfo.basements)
                    .flat()
                    .filter(slot => slot.status !== 'Occupied').length}
                </div>
                <div className="text-blue-100 text-sm">Available</div>
              </div>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-6">
            <div className="space-y-6">
              {Object.entries(parkInfo.basements).map(([basement, slots]) => (
                <div key={`${parkId}-${basement}`} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-gray-900 text-lg font-semibold">
                      Basement {basement}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        {slots.filter(slot => slot.status !== 'Occupied').length} Available
                      </span>
                      <span className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        {slots.filter(slot => slot.status === 'Occupied').length} Occupied
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
                    {slots.map((slot) => (
                      <div
                        key={slot.id}
                        className={`
                          aspect-square rounded-lg p-2
                          flex items-center justify-center
                          text-white font-semibold text-sm
                          transition-all duration-200
                          shadow-sm hover:shadow-md
                          ${slot.status === 'Occupied'
                            ? 'bg-red-500 hover:bg-red-600 cursor-not-allowed'
                            : 'bg-green-500 hover:bg-green-600 cursor-pointer'
                          }
                        `}
                        title={`Slot ${slot.slot_number} - ${slot.status}`}
                      >
                        {slot.slot_number}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Summary Stats */}
            <div className="mt-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {Object.values(parkInfo.basements).flat().length}
                  </div>
                  <div className="text-sm text-gray-600">Total Slots</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {Object.values(parkInfo.basements)
                      .flat()
                      .filter(slot => slot.status !== 'Occupied').length}
                  </div>
                  <div className="text-sm text-gray-600">Available</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600">
                    {Object.values(parkInfo.basements)
                      .flat()
                      .filter(slot => slot.status === 'Occupied').length}
                  </div>
                  <div className="text-sm text-gray-600">Occupied</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Legend */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Legend</h3>
        <div className="flex flex-wrap gap-6">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-green-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-bold">A</span>
            </div>
            <div>
              <div className="text-gray-900 font-medium">Available</div>
              <div className="text-gray-500 text-sm">Slot is free and ready for booking</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-red-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-bold">O</span>
            </div>
            <div>
              <div className="text-gray-900 font-medium">Occupied</div>
              <div className="text-gray-500 text-sm">Slot is currently in use</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SlotManagement; 