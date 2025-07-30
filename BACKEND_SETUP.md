
# MediReach Backend Setup Guide

## Option 1: Mock API (Already Implemented)
The mock API is already set up and ready to use. It simulates all the backend functionality you need for development and testing.

## Option 2: Node.js + Express + MongoDB Backend

### Project Structure
```
/medireach-backend
  /models
    Hospital.js
    BloodBank.js
    Donor.js
    Camp.js
  /routes
    hospitals.js
    bloodBanks.js
    donors.js
    camps.js
    emergency.js
  /middleware
    cors.js
    errorHandler.js
  app.js
  server.js
  .env
  package.json
```

### 1. Initialize the project
```bash
mkdir medireach-backend
cd medireach-backend
npm init -y
npm install express mongoose cors dotenv bcryptjs jsonwebtoken
npm install -D nodemon
```

### 2. Create package.json scripts
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

### 3. Create .env file
```env
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/medireach
NODE_ENV=development
JWT_SECRET=your_jwt_secret_here
```

### 4. Create MongoDB Models

#### models/Hospital.js
```javascript
const mongoose = require('mongoose');

const hospitalSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['government', 'private', 'NGO'], 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['open', 'full', 'available'], 
    required: true 
  },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  contact: { type: String, required: true },
  address: { type: String, required: true },
  facilities: [String]
}, { timestamps: true });

hospitalSchema.index({ "location": "2dsphere" });

module.exports = mongoose.model('Hospital', hospitalSchema);
```

#### models/BloodBank.js
```javascript
const mongoose = require('mongoose');

const bloodBankSchema = new mongoose.Schema({
  name: { type: String, required: true },
  bloodGroups: [{ 
    type: String, 
    enum: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'] 
  }],
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  contact: { type: String, required: true },
  address: { type: String, required: true }
}, { timestamps: true });

bloodBankSchema.index({ "location": "2dsphere" });

module.exports = mongoose.model('BloodBank', bloodBankSchema);
```

### 5. Create Express Routes

#### routes/hospitals.js
```javascript
const express = require('express');
const Hospital = require('../models/Hospital');
const router = express.Router();

// GET /api/hospitals - Get all hospitals
router.get('/', async (req, res) => {
  try {
    const hospitals = await Hospital.find();
    res.json(hospitals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/hospitals/nearby - Get nearby hospitals
router.post('/nearby', async (req, res) => {
  try {
    const { lat, lng, radius } = req.body;
    const hospitals = await Hospital.find({
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: [lng, lat] },
          $maxDistance: radius * 1000 // Convert km to meters
        }
      }
    });
    res.json(hospitals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

### 6. Create main app.js
```javascript
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/hospitals', require('./routes/hospitals'));
app.use('/api/blood-banks', require('./routes/bloodBanks'));
app.use('/api/donors', require('./routes/donors'));
app.use('/api/camps', require('./routes/camps'));
app.use('/api/emergency', require('./routes/emergency'));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### 7. Deploy to Render/Railway
1. Push code to GitHub
2. Connect to Render/Railway
3. Set environment variables
4. Deploy!

## Option 3: Supabase Integration

### Benefits
- Real-time database
- Built-in authentication
- File storage
- Edge functions
- Automatic API generation

### Setup Steps
1. Click the green Supabase button in the top right
2. Create/connect to your Supabase project
3. Create the following tables:

#### hospitals table
```sql
CREATE TABLE hospitals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('government', 'private', 'NGO')) NOT NULL,
  status TEXT CHECK (status IN ('open', 'full', 'available')) NOT NULL,
  lat DECIMAL NOT NULL,
  lng DECIMAL NOT NULL,
  contact TEXT NOT NULL,
  address TEXT NOT NULL,
  facilities TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### blood_banks table
```sql
CREATE TABLE blood_banks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  blood_groups TEXT[],
  lat DECIMAL NOT NULL,
  lng DECIMAL NOT NULL,
  contact TEXT NOT NULL,
  address TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

4. Enable Row Level Security (RLS)
5. Create policies for public read access
6. Use the auto-generated API endpoints

### Using Supabase in React
```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL!,
  process.env.REACT_APP_SUPABASE_ANON_KEY!
);

// Example usage
const { data: hospitals } = await supabase
  .from('hospitals')
  .select('*')
  .eq('status', 'open');
```

## Recommendation
For rapid development and testing, start with **Option 1 (Mock API)** which is already implemented. Then move to **Option 3 (Supabase)** for production, as it provides the most features with the least setup complexity.
