import { supabase } from './supabase'
import type { 
  User, 
  Service, 
  Booking, 
  Invoice, 
  Agent, 
  BookingAssignment, 
  Payment, 
  Area 
} from './supabase'

// Helper function to check if Supabase is properly configured
const isSupabaseConfigured = () => {
  return import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
}

// User operations
export const userService = {
  async getCurrentUser(): Promise<User | null> {
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured')
      return null
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error getting current user:', error)
      return null
    }
  },

  async createUser(userData: Partial<User>): Promise<User | null> {
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured')
      return null
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .insert(userData)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating user:', error)
      return null
    }
  },

  async updateUser(userId: string, updates: Partial<User>): Promise<User | null> {
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured')
      return null
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating user:', error)
      return null
    }
  }
}

// Service operations
export const serviceService = {
  async getAllServices(): Promise<Service[]> {
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured')
      return []
    }

    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('name')

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error getting services:', error)
      return []
    }
  },

  async getServicesByCategory(category: string): Promise<Service[]> {
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured')
      return []
    }

    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('category', category)
        .eq('is_active', true)
        .order('name')

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error getting services by category:', error)
      return []
    }
  },

  async getServiceById(id: string): Promise<Service | null> {
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured')
      return null
    }

    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error getting service by id:', error)
      return null
    }
  }
}

// Booking operations
export const bookingService = {
  async createBooking(bookingData: Omit<Booking, 'id' | 'created_at' | 'updated_at'>): Promise<Booking | null> {
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured')
      return null
    }

    try {
      const { data, error } = await supabase
        .from('bookings')
        .insert(bookingData)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating booking:', error)
      return null
    }
  },

  async getUserBookings(userId: string): Promise<Booking[]> {
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured')
      return []
    }

    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          services (
            name,
            description,
            category
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error getting user bookings:', error)
      return []
    }
  },

  async getBookingById(id: string): Promise<Booking | null> {
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured')
      return null
    }

    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          services (
            name,
            description,
            category
          )
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error getting booking by id:', error)
      return null
    }
  },

  async updateBookingStatus(id: string, status: Booking['status']): Promise<Booking | null> {
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured')
      return null
    }

    try {
      const { data, error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating booking status:', error)
      return null
    }
  },

  async updatePaymentStatus(id: string, paymentStatus: Booking['payment_status']): Promise<Booking | null> {
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured')
      return null
    }

    try {
      const { data, error } = await supabase
        .from('bookings')
        .update({ payment_status: paymentStatus })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating payment status:', error)
      return null
    }
  }
}

// Invoice operations
export const invoiceService = {
  async createInvoice(invoiceData: Omit<Invoice, 'id' | 'created_at'>): Promise<Invoice | null> {
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured')
      return null
    }

    try {
      const { data, error } = await supabase
        .from('invoices')
        .insert({
          ...invoiceData,
          invoice_number: await this.generateInvoiceNumber()
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating invoice:', error)
      return null
    }
  },

  async generateInvoiceNumber(): Promise<string> {
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured')
      return `INV-${Date.now()}`
    }

    try {
      const { data, error } = await supabase.rpc('generate_invoice_number')
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error generating invoice number:', error)
      return `INV-${Date.now()}`
    }
  },

  async getInvoicesByBooking(bookingId: string): Promise<Invoice[]> {
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured')
      return []
    }

    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('booking_id', bookingId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error getting invoices by booking:', error)
      return []
    }
  },

  async updateInvoiceStatus(id: string, paymentStatus: Invoice['payment_status']): Promise<Invoice | null> {
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured')
      return null
    }

    try {
      const { data, error } = await supabase
        .from('invoices')
        .update({ 
          payment_status: paymentStatus,
          paid_date: paymentStatus === 'paid' ? new Date().toISOString() : null
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating invoice status:', error)
      return null
    }
  }
}

// Payment operations
export const paymentService = {
  async createPayment(paymentData: Omit<Payment, 'id' | 'created_at'>): Promise<Payment | null> {
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured')
      return null
    }

    try {
      const { data, error } = await supabase
        .from('payments')
        .insert(paymentData)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating payment:', error)
      return null
    }
  },

  async getPaymentsByBooking(bookingId: string): Promise<Payment[]> {
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured')
      return []
    }

    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('booking_id', bookingId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error getting payments by booking:', error)
      return []
    }
  },

  async updatePaymentStatus(id: string, status: Payment['status']): Promise<Payment | null> {
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured')
      return null
    }

    try {
      const { data, error } = await supabase
        .from('payments')
        .update({ status })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating payment status:', error)
      return null
    }
  }
}

// Agent operations
export const agentService = {
  async getAllAgents(): Promise<Agent[]> {
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured')
      return []
    }

    try {
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .eq('is_available', true)
        .order('rating', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error getting agents:', error)
      return []
    }
  },

  async getAgentsByArea(area: string): Promise<Agent[]> {
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured')
      return []
    }

    try {
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .contains('areas_served', [area])
        .eq('is_available', true)
        .order('rating', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error getting agents by area:', error)
      return []
    }
  },

  async getAgentById(id: string): Promise<Agent | null> {
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured')
      return null
    }

    try {
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error getting agent by id:', error)
      return null
    }
  }
}

// Area operations
export const areaService = {
  async getAllAreas(): Promise<Area[]> {
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured')
      return []
    }

    try {
      const { data, error } = await supabase
        .from('areas')
        .select('*')
        .eq('is_active', true)
        .order('name')

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error getting areas:', error)
      return []
    }
  },

  async getAreasByCity(city: string): Promise<Area[]> {
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured')
      return []
    }

    try {
      const { data, error } = await supabase
        .from('areas')
        .select('*')
        .eq('city', city)
        .eq('is_active', true)
        .order('name')

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error getting areas by city:', error)
      return []
    }
  }
}

// Booking assignment operations
export const assignmentService = {
  async assignBooking(bookingId: string, agentId: string): Promise<BookingAssignment | null> {
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured')
      return null
    }

    try {
      const { data, error } = await supabase
        .from('booking_assignments')
        .insert({
          booking_id: bookingId,
          agent_id: agentId
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error assigning booking:', error)
      return null
    }
  },

  async getAssignmentsByAgent(agentId: string): Promise<BookingAssignment[]> {
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured')
      return []
    }

    try {
      const { data, error } = await supabase
        .from('booking_assignments')
        .select(`
          *,
          bookings (
            *,
            services (
              name,
              description
            )
          )
        `)
        .eq('agent_id', agentId)
        .order('assigned_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error getting assignments by agent:', error)
      return []
    }
  },

  async updateAssignmentStatus(id: string, status: BookingAssignment['status']): Promise<BookingAssignment | null> {
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured')
      return null
    }

    try {
      const { data, error } = await supabase
        .from('booking_assignments')
        .update({ status })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating assignment status:', error)
      return null
    }
  }
}
