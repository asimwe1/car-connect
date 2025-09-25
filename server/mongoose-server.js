const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const Car = require('./models/Car');
const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
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

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/carhub';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB');
  seedTestData();
})
.catch((err) => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', database: 'mongodb' });
});

// Seed test data
const seedTestData = async () => {
  try {
    // Create test users if they don't exist
    const adminExists = await User.findOne({ phone: '+250788881400' });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('carhub@1050', 12);
      await User.create({
        fullname: 'Admin One',
        email: 'admin1@gmail.com',
        phone: '+250788881400',
        password: hashedPassword,
        role: 'admin',
        isVerified: true
      });
      console.log('Admin user created');
    }

    const userExists = await User.findOne({ phone: '+250793373953' });
    if (!userExists) {
      const hashedPassword = await bcrypt.hash('carhub@1050', 12);
      await User.create({
        fullname: 'User One',
        email: 'user1@gmail.com',
        phone: '+250793373953',
        password: hashedPassword,
        role: 'user',
        isVerified: true
      });
      console.log('Test user created');
    }

    // Create demo cars if none exist
    const carCount = await Car.countDocuments();
    if (carCount === 0) {
      const adminUser = await User.findOne({ role: 'admin' });
      if (adminUser) {
        const demoCars = [
          {
            make: 'Toyota',
            model: 'Camry',
            year: 2022,
            price: 25000,
            mileage: 15000,
            fuelType: 'petrol',
            transmission: 'automatic',
            bodyType: 'Sedan',
            color: 'White',
            location: 'Kigali',
            description: 'Well maintained Toyota Camry in excellent condition.',
            images: ['/placeholder.svg'],
            primaryImage: '/placeholder.svg',
            owner: adminUser._id
          },
          {
            make: 'Honda',
            model: 'Civic',
            year: 2023,
            price: 22000,
            mileage: 8000,
            fuelType: 'petrol',
            transmission: 'manual',
            bodyType: 'Sedan',
            color: 'Blue',
            location: 'Butare',
            description: 'Sporty Honda Civic with low mileage.',
            images: ['/placeholder.svg'],
            primaryImage: '/placeholder.svg',
            owner: adminUser._id
          },
          {
            make: 'BMW',
            model: 'X5',
            year: 2021,
            price: 45000,
            mileage: 25000,
            fuelType: 'petrol',
            transmission: 'automatic',
            bodyType: 'SUV',
            color: 'Black',
            location: 'Kigali',
            description: 'Luxury BMW X5 SUV with premium features.',
            images: ['/placeholder.svg'],
            primaryImage: '/placeholder.svg',
            owner: adminUser._id
          }
        ];

        await Car.insertMany(demoCars);
        console.log('Demo cars created');
      }
    }
  } catch (error) {
    console.error('Error seeding test data:', error);
  }
};

// AUTH ENDPOINTS
app.post('/api/auth/login', async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ message: 'Phone and password are required' });
    }

    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const userResponse = {
      id: user._id,
      fullname: user.fullname,
      email: user.email,
      phone: user.phone,
      role: user.role
    };

    res.json({
      message: 'Login successful',
      user: userResponse
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { fullname, email, phone, password } = req.body;

    if (!fullname || !email || !phone || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({
      fullname,
      email,
      phone,
      password: hashedPassword,
      role: 'user',
      isVerified: true
    });

    const userResponse = {
      id: user._id,
      fullname: user.fullname,
      email: user.email,
      phone: user.phone,
      role: user.role
    };

    res.status(201).json({
      message: 'Registration successful',
      user: userResponse
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/auth/verify-otp', async (req, res) => {
  try {
    const { phone, otp } = req.body;

    // For testing, accept 123456 as valid OTP
    if (otp === '123456') {
      const user = await User.findOne({ phone });
      if (user) {
        const userResponse = {
          id: user._id,
          fullname: user.fullname,
          email: user.email,
          phone: user.phone,
          role: user.role
        };

        res.json({
          message: 'OTP verified successfully',
          user: userResponse
        });
      } else {
        res.status(404).json({ message: 'User not found' });
      }
    } else {
      res.status(400).json({ message: 'Invalid OTP' });
    }
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// CAR ENDPOINTS
app.get('/api/cars', async (req, res) => {
  try {
    const { page = 1, limit = 10, make, model, minPrice, maxPrice, status } = req.query;
    
    const filter = {};
    if (make) filter.make = new RegExp(make, 'i');
    if (model) filter.model = new RegExp(model, 'i');
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (status) filter.status = status;

    const cars = await Car.find(filter)
      .populate('owner', 'fullname email phone')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Car.countDocuments(filter);

    res.json({
      data: {
        items: cars,
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get cars error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/cars/:id', async (req, res) => {
  try {
    const car = await Car.findById(req.params.id).populate('owner', 'fullname email phone');
    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }
    res.json({ data: car });
  } catch (error) {
    console.error('Get car error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/cars', async (req, res) => {
  try {
    const carData = req.body;
    
    // Validate required fields
    if (!carData.make || !carData.model || !carData.year || !carData.price || !carData.transmission) {
      return res.status(400).json({ message: 'Missing required fields: make, model, year, price, transmission' });
    }

    // Set owner to admin user if not provided (for admin adding cars)
    if (!carData.owner) {
      const adminUser = await User.findOne({ role: 'admin' });
      if (adminUser) {
        carData.owner = adminUser._id;
      }
    }

    const car = await Car.create(carData);
    const populatedCar = await Car.findById(car._id).populate('owner', 'fullname email phone');
    
    res.status(201).json({
      message: 'Car created successfully',
      data: populatedCar
    });
  } catch (error) {
    console.error('Create car error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.put('/api/cars/:id', async (req, res) => {
  try {
    const car = await Car.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('owner', 'fullname email phone');
    
    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }
    
    res.json({
      message: 'Car updated successfully',
      data: car
    });
  } catch (error) {
    console.error('Update car error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.delete('/api/cars/:id', async (req, res) => {
  try {
    const car = await Car.findByIdAndDelete(req.params.id);
    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }
    res.json({ message: 'Car deleted successfully' });
  } catch (error) {
    console.error('Delete car error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// USER ENDPOINTS
app.get('/api/users', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const users = await User.find({}, '-password')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await User.countDocuments();

    res.json({
      data: {
        items: users,
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// BOOKING/ORDER ENDPOINTS (placeholder for now)
app.get('/api/admin/orders', async (req, res) => {
  res.json({ data: { items: [], total: 0 } });
});

app.get('/api/admin/bookings', async (req, res) => {
  res.json({ data: { items: [], total: 0 } });
});

app.get('/api/my-bookings', async (req, res) => {
  res.json({ data: { items: [], total: 0 } });
});

app.listen(PORT, () => {
  console.log(`MongoDB server running on port ${PORT}`);
});
