-- Database Schema for Educify

-- Users Table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'student',
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tutors Table
CREATE TABLE tutors (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  subject VARCHAR(255) NOT NULL,
  rate DECIMAL(10, 2) NOT NULL,
  experience INTEGER,
  rating DECIMAL(3, 2) DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  languages TEXT[],
  bio TEXT,
  location_address VARCHAR(255),
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Education Table
CREATE TABLE education (
  id SERIAL PRIMARY KEY,
  tutor_id INTEGER REFERENCES tutors(id) ON DELETE CASCADE,
  year_range VARCHAR(50),
  institution VARCHAR(255),
  degree VARCHAR(255)
);

-- Availability Table
CREATE TABLE availability (
  id SERIAL PRIMARY KEY,
  tutor_id INTEGER REFERENCES tutors(id) ON DELETE CASCADE,
  day_of_week VARCHAR(20),
  start_time TIME,
  end_time TIME,
  is_available BOOLEAN DEFAULT TRUE
);

-- Bookings Table
CREATE TABLE bookings (
  id SERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES users(id),
  tutor_id INTEGER REFERENCES tutors(id),
  subject VARCHAR(255) NOT NULL,
  booking_date DATE NOT NULL,
  booking_time TIME NOT NULL,
  duration INTEGER NOT NULL,
  location VARCHAR(100) DEFAULT 'Online',
  status VARCHAR(50) DEFAULT 'pending',
  amount DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payments Table
CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  booking_id INTEGER REFERENCES bookings(id),
  student_id INTEGER REFERENCES users(id),
  amount DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(50),
  transaction_id VARCHAR(255) UNIQUE,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reviews Table
CREATE TABLE reviews (
  id SERIAL PRIMARY KEY,
  tutor_id INTEGER REFERENCES tutors(id),
  student_id INTEGER REFERENCES users(id),
  booking_id INTEGER REFERENCES bookings(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_tutors_subject ON tutors(subject);
CREATE INDEX idx_bookings_date ON bookings(booking_date);

-- Promo Codes Table
CREATE TABLE promo_codes (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10, 2) NOT NULL,
  valid_from TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  valid_until TIMESTAMP NOT NULL,
  max_uses INTEGER,
  used_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for promo code lookups
CREATE INDEX idx_promo_code ON promo_codes(code);