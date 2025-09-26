const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:8080',
  'http://localhost:3000',
  'https://carhub-133ehgwgh-leandre000s-projects.vercel.app',
];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Firebase Admin initialization
try {
  if (!admin.apps.length) {
    admin.initializeApp({
      // Uses Application Default Credentials via GOOGLE_APPLICATION_CREDENTIALS
      credential: admin.credential.applicationDefault(),
    });
  }
  console.log('Firebase Admin initialized');
} catch (err) {
  console.error('Failed to initialize Firebase Admin:', err.message);
}

const firestore = (() => {
  try {
    return admin.firestore();
  } catch (e) {
    console.warn('Firestore not available. Falling back to in-memory storage.');
    return null;
  }
})();

// Data access: Firestore or in-memory fallback
const VEHICLES_COLLECTION = 'vehicles';
const USERS_COLLECTION = 'users';
const memoryVehicles = new Map();
const memoryUsers = new Map();

// Add test users data
const seedUsers = async () => {
  const testUsers = [
    {
      _id: '68d5491683ce5fa40a99954b',
      fullname: 'User One',
      email: 'user1@gmail.com',
      phone: '+250793373953',
      password: '$2b$12$LalazslcFM/HEWakVxQXvjoSADcQ7l1CUAlEr5dnYTvWw4S5P9i', // hashed version of 'carhub@1050'
      role: 'user',
      createdAt: new Date('2025-01-17T00:00:00Z'),
      updatedAt: new Date('2025-01-17T00:00:00Z')
    },
    {
      _id: '68d5498abc621c37fe2b5fab',
      fullname: 'Admin One',
      email: 'admin1@gmail.com',
      phone: '+250788881400',
      password: '$2b$12$LalazslcFM/HEWakVxQXvjoSADcQ7l1CUAlEr5dnYTvWw4S5P9i', // hashed version of 'carhub@1050'
      role: 'admin',
      createdAt: new Date('2025-01-17T00:00:00Z'),
      updatedAt: new Date('2025-01-17T00:00:00Z')
    }
  ];

  if (firestore) {
    try {
      for (const testUser of testUsers) {
        const userRef = firestore.collection(USERS_COLLECTION).doc(testUser._id);
        const doc = await userRef.get();
        if (!doc.exists) {
          await userRef.set(testUser);
          console.log(`Test user ${testUser.fullname} seeded to Firestore`);
        }
      }
    } catch (error) {
      console.error('Error seeding test users to Firestore:', error);
    }
  } else {
    for (const testUser of testUsers) {
      memoryUsers.set(testUser._id, testUser);
    }
    console.log('Test users seeded to memory');
  }
};

// Seed data
const seedVehicles = async () => {
  const vehicles = [
      {
        name: 'Ford Transit',
        year: 2021,
        subtitle: '4.0 D5 PowerPulse Momentum 5dr AWD',
        image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600&h=400&fit=crop',
        price: 22000,
        mileage: 2500,
        fuelType: 'Diesel',
        transmission: 'Manual',
        badge: 'Great Price',
        make: 'Ford',
      },
      {
        name: 'New GLC',
        year: 2023,
        subtitle: '4.0 D5 PowerPulse Momentum 5dr AWD',
        image: 'https://images.unsplash.com/photo-1606016595464-d0b5c54a8f87?w=600&h=400&fit=crop',
        price: 95000,
        mileage: 50,
        fuelType: 'Petrol',
        transmission: 'Automatic',
        badge: 'Low Mileage',
        make: 'Mercedes Benz',
      },
      {
        name: 'Audi A6 3.5',
        year: 2024,
        subtitle: '3.5 D5 PowerPulse Momentum 5dr AWD',
        image: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=600&h=400&fit=crop',
        price: 58000,
        mileage: 100,
        fuelType: 'Petrol',
        transmission: 'Automatic',
        make: 'Audi',
      },
      {
        name: 'Corolla Altis',
        year: 2023,
        subtitle: '3.5 D5 PowerPulse Momentum 5dr AWD',
        image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=600&h=400&fit=crop',
        price: 45000,
        mileage: 15000,
        fuelType: 'Petrol',
        transmission: 'Automatic',
        make: 'Toyota',
      },
  ];

  if (firestore) {
    const snapshot = await firestore.collection(VEHICLES_COLLECTION).limit(1).get();
    if (snapshot.empty) {
      const batch = firestore.batch();
      vehicles.forEach((v) => {
        const ref = firestore.collection(VEHICLES_COLLECTION).doc();
        batch.set(ref, {
          ...v,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      });
      await batch.commit();
      console.log('Seeded initial vehicles to Firestore');
    }
  } else if (memoryVehicles.size === 0) {
    vehicles.forEach((v) => {
      const id = Math.random().toString(36).slice(2);
      memoryVehicles.set(id, { id, ...v, createdAt: Date.now(), updatedAt: Date.now() });
    });
    console.log('Seeded initial vehicles to memory');
  }
};

// Add some demo cars for admin testing
const addDemoCars = async () => {
  const demoCars = [
    {
      _id: 'demo-car-1',
      make: 'Toyota',
      model: 'Camry',
      year: 2022,
      price: 25000,
      mileage: 15000,
      fuelType: 'Petrol',
      transmission: 'Automatic',
      status: 'available',
      bodyType: 'Sedan',
      color: 'White',
      location: 'Kigali',
      description: 'Well maintained Toyota Camry in excellent condition.',
      images: ['/placeholder.svg'],
      primaryImage: '/placeholder.svg',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: 'demo-car-2',
      make: 'Honda',
      model: 'Civic',
      year: 2023,
      price: 22000,
      mileage: 8000,
      fuelType: 'Petrol',
      transmission: 'Manual',
      status: 'available',
      bodyType: 'Sedan',
      color: 'Blue',
      location: 'Butare',
      description: 'Sporty Honda Civic with low mileage.',
      images: ['/placeholder.svg'],
      primaryImage: '/placeholder.svg',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: 'demo-car-3',
      make: 'BMW',
      model: 'X5',
      year: 2021,
      price: 45000,
      mileage: 25000,
      fuelType: 'Petrol',
      transmission: 'Automatic',
      status: 'available',
      bodyType: 'SUV',
      color: 'Black',
      location: 'Kigali',
      description: 'Luxury BMW X5 SUV with premium features.',
      images: ['/placeholder.svg'],
      primaryImage: '/placeholder.svg',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  if (firestore) {
    try {
      for (const car of demoCars) {
        const carRef = firestore.collection(VEHICLES_COLLECTION).doc(car._id);
        const doc = await carRef.get();
        if (!doc.exists) {
          await carRef.set(car);
          console.log(`Demo car ${car.make} ${car.model} seeded to Firestore`);
        }
      }
    } catch (error) {
      console.error('Error seeding demo cars to Firestore:', error);
    }
  } else {
    for (const car of demoCars) {
      memoryVehicles.set(car._id, car);
    }
    console.log('Demo cars seeded to memory');
  }
};

// Seed data on startup
seedVehicles();
seedUsers();
addDemoCars();

// AUTH ENDPOINTS
// POST /auth/login - User login
app.post('/auth/login', async (req, res) => {
  try {
    const { phone, password } = req.body;
    
    if (!phone || !password) {
      return res.status(400).json({ message: 'Phone and password are required' });
    }

    let user;
    if (firestore) {
      const snapshot = await firestore.collection(USERS_COLLECTION)
        .where('phone', '==', phone)
        .limit(1)
        .get();
      
      if (snapshot.empty) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      const doc = snapshot.docs[0];
      user = { _id: doc.id, ...doc.data() };
    } else {
      user = Array.from(memoryUsers.values()).find(u => u.phone === phone);
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
    }

    // For testing, allow the exact password 'carhub@1050' for test users
    if ((phone === '+250793373953' || phone === '+250788881400') && password === 'carhub@1050') {
      const { password: _, ...userWithoutPassword } = user;
      return res.json({ 
        success: true, 
        user: userWithoutPassword,
        message: 'Login successful' 
      });
    }
    
    return res.status(401).json({ message: 'Invalid credentials' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /auth/register - User registration
app.post('/auth/register', async (req, res) => {
  try {
    const { fullname, phone, password, email } = req.body;
    
    if (!fullname || !phone || !password) {
      return res.status(400).json({ message: 'Full name, phone, and password are required' });
    }

    // Check if user already exists
    let existingUser;
    if (firestore) {
      const snapshot = await firestore.collection(USERS_COLLECTION)
        .where('phone', '==', phone)
        .limit(1)
        .get();
      existingUser = !snapshot.empty;
    } else {
      existingUser = Array.from(memoryUsers.values()).some(u => u.phone === phone);
    }

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this phone number' });
    }

    const newUser = {
      _id: Math.random().toString(36).slice(2) + Date.now().toString(36),
      fullname,
      phone,
      email: email || '',
      password: 'hashed_password', // In real app, hash the password
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    if (firestore) {
      const userRef = firestore.collection(USERS_COLLECTION).doc(newUser._id);
      await userRef.set(newUser);
    } else {
      memoryUsers.set(newUser._id, newUser);
    }

    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json({ 
      success: true, 
      user: userWithoutPassword,
      message: 'User registered successfully' 
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /auth/verify-otp - OTP verification
app.post('/auth/verify-otp', async (req, res) => {
  try {
    const { phone, otp } = req.body;
    
    if (!phone || !otp) {
      return res.status(400).json({ message: 'Phone and OTP are required' });
    }

    // For testing, accept '123456' for test phone numbers
    if ((phone === '+250793373953' || phone === '+250788881400') && otp === '123456') {
      let user;
      if (firestore) {
        const snapshot = await firestore.collection(USERS_COLLECTION)
          .where('phone', '==', phone)
          .limit(1)
          .get();
        
        if (!snapshot.empty) {
          const doc = snapshot.docs[0];
          user = { _id: doc.id, ...doc.data() };
        }
      } else {
        user = Array.from(memoryUsers.values()).find(u => u.phone === phone);
      }

      if (user) {
        const { password: _, ...userWithoutPassword } = user;
        return res.json({ 
          success: true, 
          user: userWithoutPassword,
          message: 'OTP verified successfully' 
        });
      }
    }
    
    return res.status(400).json({ message: 'Invalid OTP' });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/vehicles - Get all vehicles with filtering and sorting
app.get('/api/vehicles', async (req, res) => {
  try {
    const { search, make, year, sort } = req.query;
    let vehicles = [];

    if (firestore) {
      let ref = firestore.collection(VEHICLES_COLLECTION);
      // Client-side filtering since Firestore compound queries vary; demo-safe
      const snapshot = await ref.get();
      vehicles = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    } else {
      vehicles = Array.from(memoryVehicles.values());
    }

    // Apply filters
    if (search) {
      const s = String(search).toLowerCase();
      vehicles = vehicles.filter((v) =>
        [v.name, v.subtitle, v.make].some((val) => String(val || '').toLowerCase().includes(s))
      );
    }
    if (make) {
      const m = String(make).toLowerCase();
      vehicles = vehicles.filter((v) => String(v.make || '').toLowerCase().includes(m));
    }
    if (year) {
      const y = parseInt(String(year));
      vehicles = vehicles.filter((v) => Number(v.year) === y);
    }

    // Sorting
    const sortKey = String(sort || 'newest');
    const sorters = {
      price_low: (a, b) => Number(a.price) - Number(b.price),
      price_high: (a, b) => Number(b.price) - Number(a.price),
      year_new: (a, b) => Number(b.year) - Number(a.year),
      mileage: (a, b) => Number(a.mileage || 0) - Number(b.mileage || 0),
      newest: (a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0),
    };
    vehicles.sort(sorters[sortKey] || sorters.newest);

    res.json(vehicles);
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/cars - Get all cars with filtering, sorting, and pagination
app.get('/api/cars', async (req, res) => {
  try {
    const { 
      search, 
      make, 
      year, 
      sort, 
      page = 1, 
      limit = 10,
      status,
      minPrice,
      maxPrice,
      q
    } = req.query;
    
    let vehicles = [];

    if (firestore) {
      let ref = firestore.collection(VEHICLES_COLLECTION);
      const snapshot = await ref.get();
      vehicles = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    } else {
      vehicles = Array.from(memoryVehicles.values());
    }

    // Apply filters
    if (search || q) {
      const s = String(search || q || '').toLowerCase();
      vehicles = vehicles.filter((v) =>
        [v.name, v.subtitle, v.make, v.model].some((val) => String(val || '').toLowerCase().includes(s))
      );
    }
    if (make) {
      const m = String(make).toLowerCase();
      vehicles = vehicles.filter((v) => String(v.make || '').toLowerCase().includes(m));
    }
    if (year) {
      const y = parseInt(String(year));
      vehicles = vehicles.filter((v) => Number(v.year) === y);
    }
    if (status) {
      vehicles = vehicles.filter((v) => String(v.status || 'available').toLowerCase() === String(status).toLowerCase());
    }
    if (minPrice) {
      vehicles = vehicles.filter((v) => Number(v.price) >= Number(minPrice));
    }
    if (maxPrice) {
      vehicles = vehicles.filter((v) => Number(v.price) <= Number(maxPrice));
    }

    // Sorting
    const sortKey = String(sort || 'newest');
    const sorters = {
      price_low: (a, b) => Number(a.price) - Number(b.price),
      price_high: (a, b) => Number(b.price) - Number(a.price),
      year_new: (a, b) => Number(b.year) - Number(a.year),
      mileage: (a, b) => Number(a.mileage || 0) - Number(b.mileage || 0),
      newest: (a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0),
    };
    vehicles.sort(sorters[sortKey] || sorters.newest);

    // Pagination
    const pageNum = Math.max(1, parseInt(String(page)));
    const limitNum = Math.max(1, Math.min(100, parseInt(String(limit))));
    const total = vehicles.length;
    const totalPages = Math.ceil(total / limitNum);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedVehicles = vehicles.slice(startIndex, endIndex);

    res.json({
      data: {
        items: paginatedVehicles,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages
      }
    });
  } catch (error) {
    console.error('Error fetching cars:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/vehicles/:id - Get single vehicle
app.get('/api/vehicles/:id', async (req, res) => {
  try {
    let vehicle;
    if (firestore) {
      const doc = await firestore.collection(VEHICLES_COLLECTION).doc(req.params.id).get();
      vehicle = doc.exists ? { id: doc.id, ...doc.data() } : null;
    } else {
      vehicle = memoryVehicles.get(req.params.id) || null;
    }
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    res.json(vehicle);
  } catch (error) {
    console.error('Error fetching vehicle:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/cars/:id - Get single car
app.get('/api/cars/:id', async (req, res) => {
  try {
    let vehicle;
    if (firestore) {
      const doc = await firestore.collection(VEHICLES_COLLECTION).doc(req.params.id).get();
      vehicle = doc.exists ? { id: doc.id, ...doc.data() } : null;
    } else {
      vehicle = memoryVehicles.get(req.params.id) || null;
    }
    if (!vehicle) {
      return res.status(404).json({ message: 'Car not found' });
    }
    res.json(vehicle);
  } catch (error) {
    console.error('Error fetching car:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/vehicles - Create new vehicle
app.post('/api/vehicles', async (req, res) => {
  try {
    if (firestore) {
      const ref = await firestore.collection(VEHICLES_COLLECTION).add({
        ...req.body,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      const doc = await ref.get();
      return res.status(201).json({ id: doc.id, ...doc.data() });
    } else {
      const id = Math.random().toString(36).slice(2);
      const record = { id, ...req.body, createdAt: Date.now(), updatedAt: Date.now() };
      memoryVehicles.set(id, record);
      return res.status(201).json(record);
    }
  } catch (error) {
    console.error('Error creating vehicle:', error);
    res.status(400).json({ message: error.message });
  }
});

// POST /api/cars - Create new car
app.post('/api/cars', async (req, res) => {
  try {
    // Validate required fields
    const { make, model, year, price, transmission } = req.body;
    if (!make || !model || !year || !price || !transmission) {
      return res.status(400).json({ 
        message: 'Missing required fields: make, model, year, price, transmission' 
      });
    }

    if (firestore) {
      const ref = await firestore.collection(VEHICLES_COLLECTION).add({
        ...req.body,
        status: req.body.status || 'available',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      const doc = await ref.get();
      return res.status(201).json({ 
        message: 'Car created successfully',
        data: { id: doc.id, ...doc.data() }
      });
    } else {
      const id = Math.random().toString(36).slice(2);
      const record = { 
        id, 
        ...req.body, 
        status: req.body.status || 'available',
        createdAt: Date.now(), 
        updatedAt: Date.now() 
      };
      memoryVehicles.set(id, record);
      return res.status(201).json({ 
        message: 'Car created successfully',
        data: record 
      });
    }
  } catch (error) {
    console.error('Error creating car:', error);
    res.status(400).json({ message: error.message });
  }
});

// PUT /api/vehicles/:id - Update vehicle
app.put('/api/vehicles/:id', async (req, res) => {
  try {
    let updated;
    if (firestore) {
      const ref = firestore.collection(VEHICLES_COLLECTION).doc(req.params.id);
      const doc = await ref.get();
      if (!doc.exists) return res.status(404).json({ message: 'Vehicle not found' });
      await ref.update({ ...req.body, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
      const after = await ref.get();
      updated = { id: after.id, ...after.data() };
    } else {
      const existing = memoryVehicles.get(req.params.id);
      if (!existing) return res.status(404).json({ message: 'Vehicle not found' });
      updated = { ...existing, ...req.body, updatedAt: Date.now() };
      memoryVehicles.set(req.params.id, updated);
    }
    if (!updated) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    res.json(updated);
  } catch (error) {
    console.error('Error updating vehicle:', error);
    res.status(400).json({ message: error.message });
  }
});

// PUT /api/cars/:id - Update car
app.put('/api/cars/:id', async (req, res) => {
  try {
    let updated;
    if (firestore) {
      const ref = firestore.collection(VEHICLES_COLLECTION).doc(req.params.id);
      const doc = await ref.get();
      if (!doc.exists) return res.status(404).json({ message: 'Car not found' });
      await ref.update({ ...req.body, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
      const after = await ref.get();
      updated = { id: after.id, ...after.data() };
    } else {
      const existing = memoryVehicles.get(req.params.id);
      if (!existing) return res.status(404).json({ message: 'Car not found' });
      updated = { ...existing, ...req.body, updatedAt: Date.now() };
      memoryVehicles.set(req.params.id, updated);
    }
    if (!updated) {
      return res.status(404).json({ message: 'Car not found' });
    }
    res.json({
      message: 'Car updated successfully',
      data: updated
    });
  } catch (error) {
    console.error('Error updating car:', error);
    res.status(400).json({ message: error.message });
  }
});

// DELETE /api/vehicles/:id - Delete vehicle
app.delete('/api/vehicles/:id', async (req, res) => {
  try {
    let existed = false;
    if (firestore) {
      const ref = firestore.collection(VEHICLES_COLLECTION).doc(req.params.id);
      const doc = await ref.get();
      if (!doc.exists) return res.status(404).json({ message: 'Vehicle not found' });
      await ref.delete();
      existed = true;
    } else {
      existed = memoryVehicles.delete(req.params.id);
      if (!existed) return res.status(404).json({ message: 'Vehicle not found' });
    }
    if (!existed) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    res.json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// DELETE /api/cars/:id - Delete car
app.delete('/api/cars/:id', async (req, res) => {
  try {
    let existed = false;
    if (firestore) {
      const ref = firestore.collection(VEHICLES_COLLECTION).doc(req.params.id);
      const doc = await ref.get();
      if (!doc.exists) return res.status(404).json({ message: 'Car not found' });
      await ref.delete();
      existed = true;
    } else {
      existed = memoryVehicles.delete(req.params.id);
      if (!existed) return res.status(404).json({ message: 'Car not found' });
    }
    if (!existed) {
      return res.status(404).json({ message: 'Car not found' });
    }
    res.json({ message: 'Car deleted successfully' });
  } catch (error) {
    console.error('Error deleting car:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});