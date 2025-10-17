// Typescript interfaces for educify goes here

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: 'student' | 'tutor';
  phone?: string;
  created_at: Date;
}

export interface Tutor {
  id: number;
  user_id: number;
  subject: string;
  rate: number;
  experience?: number;
  rating: number;
  reviews_count: number;
  languages?: string[];
  bio?: string;
  location_address?: string;
  location_lat?: number;
  location_lng?: number;
  verified: boolean;
  created_at: Date;
}

export interface Booking {
  id: number;
  student_id: number;
  tutor_id: number;
  subject: string;
  booking_date: Date;
  booking_time: string;
  duration: number;
  location: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  amount: number;
  created_at: Date;
}

export interface Payment {
  id: number;
  booking_id: number;
  student_id: number;
  amount: number;
  payment_method: string;
  transaction_id: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  created_at: Date;
}

export interface PromoCode {
  id: number;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  valid_from: Date;
  valid_until: Date;
  max_uses?: number;
  used_count: number;
  is_active: boolean;
  created_at: Date;
}