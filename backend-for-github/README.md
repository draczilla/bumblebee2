# MLM Referral Tracker API

A Node.js backend API for managing user referral systems with hierarchical relationships. Users can register with referral codes, view their upline (ancestors) and downline (descendants) using efficient PostgreSQL recursive queries.

## Features

- **User Registration**: Register with a referral code from an existing user
- **JWT Authentication**: Secure token-based authentication
- **Hierarchical Queries**: Efficient recursive CTE queries for upline/downline relationships
- **Unique Referral Codes**: Auto-generated 6-character alphanumeric codes
- **PostgreSQL Database**: Robust relational database with proper indexing
- **RESTful API**: Clean, well-documented API endpoints

## Quick Start

1. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials and JWT secret
   ```

2. **Database Setup**
   ```bash
   # Create PostgreSQL database
   createdb mlm_referral_db
   
   # Run migrations
   npm run migrate
   ```

3. **Install Dependencies & Start**
   ```bash
   npm install
   npm run dev
   ```

The API will be running at `http://localhost:3000`

## API Endpoints

### Authentication

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepass123",
  "referralCode": "ABC123"
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepass123"
}
```

### User Data (Protected Routes)

All user routes require JWT token in Authorization header:
```http
Authorization: Bearer <your-jwt-token>
```

#### Get User Profile
```http
GET /api/users/profile
```

#### Get Upline (Ancestors)
```http
GET /api/users/upline
```

#### Get Downline (Descendants)
```http
GET /api/users/downline
```

## Database Schema

```sql
users (
  id SERIAL PRIMARY KEY,
  public_id UUID UNIQUE DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  referral_code VARCHAR(10) UNIQUE NOT NULL,
  referred_by_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
)
```

## Environment Variables

```env
DATABASE_URL=postgresql://username:password@localhost:5432/mlm_referral_db
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
PORT=3000
NODE_ENV=development
```

## Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with auto-restart
- `npm run migrate` - Run database migrations

## Architecture

```
src/
├── config/
│   └── database.js      # PostgreSQL connection
├── controllers/
│   ├── authController.js # Authentication logic
│   └── userController.js # User data queries
├── middleware/
│   └── auth.js          # JWT authentication
├── routes/
│   ├── auth.js          # Auth endpoints
│   └── users.js         # User endpoints
├── utils/
│   ├── generateReferralCode.js
│   └── hashPassword.js
├── app.js               # Express app setup
└── server.js            # Server startup

migrations/
└── 001_create_users_table.sql
```

## Security Features

- Password hashing with bcrypt (12 rounds)
- JWT token authentication with expiration
- Input validation and sanitization
- SQL injection protection with parameterized queries
- CORS configuration
- Environment-based configuration

## Testing the API

1. **Health Check**
   ```bash
   curl http://localhost:3000/health
   ```

2. **Create First User** (Root of referral tree)
   - You'll need to manually insert a root user or modify registration logic for the first user

3. **Register New User**
   ```bash
   curl -X POST http://localhost:3000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"user@example.com","password":"password123","referralCode":"ROOT01"}'
   ```

4. **Login and Get Token**
   ```bash
   curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"user@example.com","password":"password123"}'
   ```

5. **Get User Data**
   ```bash
   curl -X GET http://localhost:3000/api/users/profile \
     -H "Authorization: Bearer <your-token>"
   ```