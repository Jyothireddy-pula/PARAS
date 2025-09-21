import { supabase } from '../lib/supabase';

/**
 * Service to handle automatic booking cancellation and billing
 */
class AutoCancellationService {
  constructor() {
    this.checkInterval = null;
    this.isRunning = false;
  }

  /**
   * Start the auto-cancellation service
   * Checks every 5 minutes for expired bookings
   */
  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.checkInterval = setInterval(async () => {
      try {
        await this.checkAndCancelExpiredBookings();
      } catch (error) {
        console.error('Error in auto-cancellation service:', error);
      }
    }, 5 * 60 * 1000); // Check every 5 minutes

    console.log('Auto-cancellation service started');
  }

  /**
   * Stop the auto-cancellation service
   */
  stop() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.isRunning = false;
    console.log('Auto-cancellation service stopped');
  }

  /**
   * Check for and cancel expired bookings
   */
  async checkAndCancelExpiredBookings() {
    try {
      const { data, error } = await supabase.rpc('auto_cancel_expired_bookings');
      
      if (error) {
        console.error('Error auto-cancelling bookings:', error);
        return;
      }

      if (data > 0) {
        console.log(`Auto-cancelled ${data} expired bookings`);
        // You could emit an event here to notify the frontend
        this.notifyExpiredBookings(data);
      }
    } catch (error) {
      console.error('Error checking expired bookings:', error);
    }
  }

  /**
   * Get real-time billing information for a booking
   */
  async getActiveBookingCost(bookingId) {
    try {
      const { data, error } = await supabase.rpc('get_active_booking_cost', {
        p_booking_id: bookingId
      });

      if (error) throw error;
      return data[0] || null;
    } catch (error) {
      console.error('Error getting active booking cost:', error);
      return null;
    }
  }

  /**
   * Calculate billing for a booking from booking time to current time
   */
  async calculateBookingBilling(bookingId, endTime = null) {
    try {
      const { data, error } = await supabase.rpc('calculate_booking_billing', {
        p_booking_id: bookingId,
        p_end_time: endTime || new Date().toISOString()
      });

      if (error) throw error;
      return data[0] || null;
    } catch (error) {
      console.error('Error calculating booking billing:', error);
      return null;
    }
  }

  /**
   * Cancel a booking manually
   */
  async cancelBooking(bookingId, reason = 'driver_cancel') {
    try {
      const { data, error } = await supabase.rpc('cancel_booking', {
        p_booking_id: bookingId,
        p_cancellation_reason: reason,
        p_cancellation_time: new Date().toISOString()
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error cancelling booking:', error);
      throw error;
    }
  }

  /**
   * Get active bookings with billing information
   */
  async getActiveBookingsWithBilling() {
    try {
      const { data, error } = await supabase
        .from('active_bookings_with_billing')
        .select('*');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting active bookings:', error);
      return [];
    }
  }

  /**
   * Notify about expired bookings (placeholder for future implementation)
   */
  notifyExpiredBookings(count) {
    // This could be implemented to show notifications to users
    // or send push notifications about expired bookings
    console.log(`Notified about ${count} expired bookings`);
  }

  /**
   * Check if a booking is about to expire (within 15 minutes)
   */
  async getBookingsExpiringSoon() {
    try {
      const { data, error } = await supabase
        .from('active_bookings_with_billing')
        .select('*')
        .eq('billing_status', 'warning');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting expiring bookings:', error);
      return [];
    }
  }

  /**
   * Get booking statistics
   */
  async getBookingStats() {
    try {
      const { data, error } = await supabase
        .from('active_bookings_with_billing')
        .select('billing_status');

      if (error) throw error;

      const stats = {
        active: 0,
        warning: 0,
        expired: 0,
        total: data.length
      };

      data.forEach(booking => {
        stats[booking.billing_status] = (stats[booking.billing_status] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('Error getting booking stats:', error);
      return { active: 0, warning: 0, expired: 0, total: 0 };
    }
  }
}

// Create a singleton instance
const autoCancellationService = new AutoCancellationService();

export default autoCancellationService;
