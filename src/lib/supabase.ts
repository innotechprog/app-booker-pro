import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key'

// Only throw error in production
if (import.meta.env.PROD && (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY)) {
  console.warn('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface User {
  id: string
  email: string
  full_name?: string
  phone?: string
  created_at: string
  updated_at: string
}

export interface Service {
  id: string
  name: string
  description: string
  category: string
  base_price: number
  is_active: boolean
  created_at: string
}

export interface Booking {
  id: string
  user_id: string
  service_id: string
  service_type: string
  specific_service: string
  custom_service?: string
  date: string
  time: string
  location: string
  description: string
  urgency: 'low' | 'normal' | 'high' | 'urgent'
  contact_method: 'phone' | 'email' | 'sms'
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'
  estimated_cost: number
  payment_status: 'pending' | 'paid' | 'failed'
  payment_method: 'payfast' | 'bank_transfer'
  billing_address: string
  created_at: string
  updated_at: string
}

export interface Invoice {
  id: string
  booking_id: string
  invoice_number: string
  amount: number
  payment_status: 'pending' | 'paid' | 'overdue'
  payment_method: 'bank_transfer'
  due_date: string
  paid_date?: string
  bank_details: {
    bank_name: string
    account_number: string
    account_holder: string
    reference: string
  }
  created_at: string
}

export interface Agent {
  id: string
  user_id: string
  full_name: string
  phone: string
  email: string
  areas_served: string[]
  services_offered: string[]
  is_verified: boolean
  is_available: boolean
  rating: number
  total_bookings: number
  created_at: string
  updated_at: string
}

export interface BookingAssignment {
  id: string
  booking_id: string
  agent_id: string
  assigned_at: string
  status: 'assigned' | 'accepted' | 'rejected' | 'completed'
  notes?: string
}

export interface Payment {
  id: string
  booking_id: string
  invoice_id?: string
  amount: number
  payment_method: 'payfast' | 'bank_transfer'
  transaction_id?: string
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  payment_date: string
  created_at: string
}

export interface Area {
  id: string
  name: string
  city: string
  province: string
  is_active: boolean
  created_at: string
}
