import { supabase } from '../lib/supabase';

/* =========================
   AUTH
========================= */

export const signUp = async ({ email, password, name, vehicleNumber }) => {
  try {
    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();

    if (existingProfile) {
      throw new Error('User with this email already exists');
    }

    // Sign up user
    const { data: authData, error: authError } =
      await supabase.auth.signUp({
        email,
        password,
      });

    if (authError) throw authError;

    // Create profile with default role
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert(
        [
          {
            id: authData.user.id,
            email,
            full_name: name,
            vehicle_number: vehicleNumber,
            role: 'driver', // default role
          },
        ],
        { onConflict: 'id' }
      );

    if (profileError) throw profileError;

    return { user: authData.user };
  } catch (error) {
    throw error;
  }
};

export const signIn = async ({ email, password }) => {
  const {
    data: { user, session },
    error,
  } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return { user, session, profile };
};

export const guestSignIn = async () => {
  return signIn({
    email: 'guest@example.com',
    password: 'guest123',
  });
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

/* =========================
   BOOKINGS
========================= */

export const saveBooking = async (bookingData) => {
  const { data, error } = await supabase
    .from('bookings')
    .insert([bookingData]);

  if (error) throw error;
  return data;
};

export const fetchCities = async () => {
  const { data, error } = await supabase
    .from('cities')
    .select('*')
    .order('name');

  if (error) throw error;
  return data;
};

export const createParking = async (parkingData) => {
  const parkingWithImage = {
    ...parkingData,
    image_url:
      'https://ipmshfkymnflueddojcw.supabase.co/storage/v1/object/public/parking-images/premium_photo-1661902046698-40bba703f396.jpg',
  };

  const { data, error } = await supabase
    .from('it_parks')
    .insert([parkingWithImage])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const createParkingSlots = async (slotsData) => {
  const { data, error } = await supabase
    .from('parking_slots')
    .insert(slotsData);

  if (error) throw error;
  return data;
};

export const fetchBookingStatistics = async (timeFrame) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('User not logged in');

  const { data, error } = await supabase
    .from('bookings')
    .select(`
      id,
      created_at,
      slot_id,
      parking_slots (
        park_id,
        it_parks (
          id,
          name,
          price_per_hour,
          profile_id
        )
      )
    `)
    .eq('parking_slots.it_parks.profile_id', user.id)
    .gte('created_at', getDateRange(timeFrame))
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
};

export const fetchBookingsByCity = async (city) => {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('city', city);

  if (error) return [];
  return data;
};

/* =========================
   CONGESTION
========================= */

export const fetchCongestionData = async () => {
  const { data, error } = await supabase.rpc('get_congestion_data');
  if (error) throw error;
  return data;
};

export const fetchCongestionFromML = async (
  params = { days: 30, lookback_days: 7 }
) => {
  const base = import.meta.env.VITE_CONGESTION_ML_URL;
  if (!base) {
    throw new Error('VITE_CONGESTION_ML_URL not set');
  }

  const url = new URL('/api/congestion', base);
  url.searchParams.set('days', params.days);
  url.searchParams.set('lookback_days', params.lookback_days);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error('ML API error');

  return res.json();
};

/* =========================
   ROLE (RBAC)
========================= */

export const getUserRole = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();

  if (error || !data) return 'driver';
  return data.role;
};

/* =========================
   HELPERS
========================= */

const getDateRange = (timeFrame) => {
  const now = new Date();

  switch (timeFrame) {
    case 'day':
      return new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();
    case 'week':
      return new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString();
    case 'month':
      return new Date(now - 365 * 24 * 60 * 60 * 1000).toISOString();
    default:
      return new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();
  }
};
