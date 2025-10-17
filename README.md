# Educify Backend API

> Backend API for Educify platform - Built with Node.js, Express, TypeScript & PostgreSQL

## Project Overview

This backend was developed based on the instruction:

> **"Develop and implement all the necessary backend APIs, endpoints, and related functionalities required to support the provided frontend designs."**

The 3 Figma images were analyzed, data flow and endpoints was establish and this backend implements all APIs needed to power those designs.

---

##  What This Backend Does

The following are established from the Images provided:

### Image 1: Tutor Profile Page
- Display tutor details (name, subject, rate, rating, reviews)
- Show tutor experience and education
- Display availability schedule with time slots
- Enable lesson booking with selected time slots
- Support trial sessions

### Image 2: Tutor Listing with Map Feature
- List all available tutors with filters (subject, rate, location)
- **Map-based location search** - Find tutors nearby using coordinates
- Display tutor cards with basic information
- Show tutor locations on map with distance

### Image 3: Checkout & Payment
- Display booking summary (tutor, subject, date, time, amount)
- **Promo code validation and discount calculation**
- Process payments with multiple methods (Card, PayPal, Educify Wallet)
- Handle payment confirmation

---

##  Project Structure

```
educify-backend/
├── src/
│   ├── server.ts                 # Main server setup and database connection
│   ├── types/
│   │   └── index.ts             # TypeScript interfaces for database models
│   ├── middleware/
│   │   └── auth.ts              # JWT authentication middleware
│   ├── routes/
│   │   ├── auth.ts              # User registration and login endpoints
│   │   ├── tutors.ts            # Tutor management and location search endpoints
│   │   ├── bookings.ts          # Booking creation and management endpoints
│   │   ├── payments.ts          # Payment processing endpoints
│   │   └── promos.ts            # Promo code validation and discount endpoints
│   └── database/
│       └── schema.sql           # Database tables for Educify platform
├── package.json                  # Dependencies and scripts for the Educify backend
├── tsconfig.json                 # TypeScript compiler configuration
├── .env.example                  # Environment variables and configuration
└── README.md
```

---

##  Features Implemented

### Core Features:
✅ User Authentication (Register/Login with JWT)  
✅ Tutor Profile Management  
✅ Tutor Search and Filtering  
✅ Booking System with Scheduling  
✅ Payment Processing  
✅ Review & Rating System  

### Special Features (From Design Requirements):
✅ **Location-Based Search** - Find tutors by map coordinates (Image 2)  
✅ **Promo Code System** - Validate and apply discount codes at checkout (Image 3)  

---

##  Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcrypt

---

##  Setup Instructions

### 1. Clone the Repository
```bash
git clone <repository-url>
cd educify-backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup PostgreSQL Database
Create a new PostgreSQL database:
```bash
createdb educify
```

Run the schema file to create all tables:
```bash
psql -U postgres -d educify -f src/database/schema.sql
```

### 4. Configure Environment Variables
Update `.env`:

### 5. Run the Server

**Development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm run build
npm start
```

Server will run on: `http://localhost:5000`

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |

### Tutors
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/tutors` | Get all tutors with filters | No |
| GET | `/api/tutors/nearby` | Find tutors by location (map feature) | No |
| GET | `/api/tutors/:id` | Get tutor details with reviews | No |
| POST | `/api/tutors` | Create tutor profile | Yes |
| PUT | `/api/tutors/:id/availability` | Update tutor availability | Yes |

### Bookings
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/bookings` | Get user bookings | Yes |
| POST | `/api/bookings` | Create new booking | Yes |
| PATCH | `/api/bookings/:id` | Update booking status | Yes |
| POST | `/api/bookings/:id/review` | Add review and rating | Yes |

### Payments
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/payments` | Process payment | Yes |
| GET | `/api/payments/booking/:id` | Get payment details by booking | Yes |

### Promo Codes
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/promos/validate` | Validate promo code | Yes |
| POST | `/api/promos/apply` | Apply promo code and calculate discount | Yes |
| POST | `/api/promos/create` | Create new promo code | Yes |

---

## Database Schema

The PostgreSQL database includes these tables:

- **users** - User accounts (students and tutors)
- **tutors** - Tutor profiles with location coordinates
- **education** - Tutor education history
- **availability** - Tutor availability schedule and time slots
- **bookings** - Lesson bookings with date and time
- **payments** - Payment transactions
- **reviews** - Tutor reviews and ratings
- **promo_codes** - Promotional discount codes

All relationships are properly established with foreign keys and indexes for optimal performance.

---

##  Requirements Fulfilled

This backend successfully implements all necessary APIs and endpoints as per the instruction:
