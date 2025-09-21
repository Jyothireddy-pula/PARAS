import { supabase } from '../lib/supabase';

export const updateSlotStatus = async (slotId, status) => {
  try {
    const { data, error } = await supabase
      .from('parking_slots')
      .update({ status })
      .eq('id', slotId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating slot status:', error);
    throw error;
  }
};

export const getSlotAvailability = async (parkId, basement = null, date = null, timeRange = null) => {
  try {
    let query = supabase
      .from('parking_slots')
      .select('*')
      .eq('park_id', parkId);

    // Only filter by basement if provided
    if (basement !== null) {
      query = query.eq('basement_number', basement);
    }

    // Don't filter by status - we want all slots to check availability
    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting slot availability:', error);
    throw error;
  }
}; 