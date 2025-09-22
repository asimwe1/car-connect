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
const memoryVehicles = new Map();

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

// Seed data on startup
seedVehicles();

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

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});