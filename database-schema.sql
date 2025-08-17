-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE urgency_level AS ENUM ('low', 'normal', 'high', 'urgent');
CREATE TYPE contact_method AS ENUM ('phone', 'email', 'sms');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'overdue');
CREATE TYPE payment_method AS ENUM ('payfast', 'bank_transfer');
CREATE TYPE assignment_status AS ENUM ('assigned', 'accepted', 'rejected', 'completed');

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Areas table
CREATE TABLE public.areas (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    city TEXT NOT NULL,
    province TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Services table
CREATE TABLE public.services (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    base_price DECIMAL(10,2) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agents table
CREATE TABLE public.agents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    areas_served TEXT[] DEFAULT '{}',
    services_offered TEXT[] DEFAULT '{}',
    is_verified BOOLEAN DEFAULT false,
    is_available BOOLEAN DEFAULT true,
    rating DECIMAL(3,2) DEFAULT 0.00,
    total_bookings INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bookings table
CREATE TABLE public.bookings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    service_id UUID REFERENCES public.services(id),
    service_type TEXT NOT NULL,
    specific_service TEXT NOT NULL,
    custom_service TEXT,
    date DATE NOT NULL,
    time TIME NOT NULL,
    location TEXT NOT NULL,
    description TEXT,
    urgency urgency_level DEFAULT 'normal',
    contact_method contact_method DEFAULT 'phone',
    status booking_status DEFAULT 'pending',
    estimated_cost DECIMAL(10,2) NOT NULL,
    payment_status payment_status DEFAULT 'pending',
    payment_method payment_method,
    billing_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invoices table
CREATE TABLE public.invoices (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
    invoice_number TEXT UNIQUE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_status payment_status DEFAULT 'pending',
    payment_method payment_method DEFAULT 'bank_transfer',
    due_date DATE NOT NULL,
    paid_date DATE,
    bank_details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Booking assignments table
CREATE TABLE public.booking_assignments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status assignment_status DEFAULT 'assigned',
    notes TEXT,
    UNIQUE(booking_id, agent_id)
);

-- Payments table
CREATE TABLE public.payments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
    invoice_id UUID REFERENCES public.invoices(id),
    amount DECIMAL(10,2) NOT NULL,
    payment_method payment_method NOT NULL,
    transaction_id TEXT,
    status payment_status DEFAULT 'pending',
    payment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX idx_bookings_status ON public.bookings(status);
CREATE INDEX idx_bookings_date ON public.bookings(date);
CREATE INDEX idx_invoices_booking_id ON public.invoices(booking_id);
CREATE INDEX idx_payments_booking_id ON public.payments(booking_id);
CREATE INDEX idx_agents_user_id ON public.agents(user_id);
CREATE INDEX idx_agents_available ON public.agents(is_available);
CREATE INDEX idx_booking_assignments_booking_id ON public.booking_assignments(booking_id);
CREATE INDEX idx_booking_assignments_agent_id ON public.booking_assignments(agent_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON public.agents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to generate invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
    next_number INTEGER;
    invoice_number TEXT;
BEGIN
    SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM 5) AS INTEGER)), 0) + 1
    INTO next_number
    FROM public.invoices;
    
    invoice_number := 'INV-' || LPAD(next_number::TEXT, 6, '0');
    RETURN invoice_number;
END;
$$ LANGUAGE plpgsql;

-- Insert sample data
INSERT INTO public.areas (name, city, province) VALUES
('Sandton', 'Johannesburg', 'Gauteng'),
('Soweto', 'Johannesburg', 'Gauteng'),
('Midrand', 'Johannesburg', 'Gauteng'),
('Centurion', 'Pretoria', 'Gauteng'),
('Hatfield', 'Pretoria', 'Gauteng'),
('Benoni', 'Ekurhuleni', 'Gauteng'),
('Boksburg', 'Ekurhuleni', 'Gauteng'),
('Krugersdorp', 'West Rand', 'Gauteng');

INSERT INTO public.services (name, description, category, base_price) VALUES
('Grocery Shopping', 'Pick up groceries from your preferred store', 'Errand Running', 150.00),
('Prescription Pickup', 'Collect prescriptions from pharmacy', 'Errand Running', 120.00),
('Dry Cleaning', 'Drop off or collect dry cleaning', 'Errand Running', 100.00),
('Package Delivery', 'Deliver packages, gifts, or documents', 'Delivery Services', 200.00),
('Food Delivery', 'Deliver meals or food items', 'Delivery Services', 180.00),
('Appointment Scheduling', 'Schedule appointments on your behalf', 'Personal Assistance', 80.00),
('File Organization', 'Organize files or paperwork', 'Personal Assistance', 120.00),
('Light Cleaning', 'Basic cleaning and tidying', 'Household Tasks', 250.00),
('Pet Feeding', 'Feed pets when you''re away', 'Household Tasks', 100.00),
('Document Filing', 'File or copy documents', 'Business Support', 150.00),
('Event Setup', 'Help with event setup and coordination', 'Event Assistance', 300.00),
('Child Pickup', 'Pick up children from school or activities', 'Childcare Support', 200.00);

-- Set up Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Areas are public
CREATE POLICY "Areas are viewable by everyone" ON public.areas FOR SELECT USING (true);

-- Services are public
CREATE POLICY "Services are viewable by everyone" ON public.services FOR SELECT USING (true);

-- Agents are viewable by everyone
CREATE POLICY "Agents are viewable by everyone" ON public.agents FOR SELECT USING (true);

-- Bookings policies
CREATE POLICY "Users can view own bookings" ON public.bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own bookings" ON public.bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own bookings" ON public.bookings FOR UPDATE USING (auth.uid() = user_id);

-- Invoices policies
CREATE POLICY "Users can view own invoices" ON public.invoices FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.bookings WHERE id = booking_id AND user_id = auth.uid())
);
CREATE POLICY "Users can create invoices for own bookings" ON public.invoices FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.bookings WHERE id = booking_id AND user_id = auth.uid())
);

-- Payments policies
CREATE POLICY "Users can view own payments" ON public.payments FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.bookings WHERE id = booking_id AND user_id = auth.uid())
);
CREATE POLICY "Users can create payments for own bookings" ON public.payments FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.bookings WHERE id = booking_id AND user_id = auth.uid())
);

-- Booking assignments (agents can see their assignments)
CREATE POLICY "Agents can view own assignments" ON public.booking_assignments FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.agents WHERE id = agent_id AND user_id = auth.uid())
);
CREATE POLICY "Agents can update own assignments" ON public.booking_assignments FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.agents WHERE id = agent_id AND user_id = auth.uid())
);
