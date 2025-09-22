// Vercel serverless function for vehicles API
const cors = require('cors');

// Mock vehicle data
const mockVehicles = [
  {
    _id: '1',
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
    location: 'Kigali, Rwanda',
    seats: 5,
    condition: 'Used',
    createdAt: new Date().toISOString()
  },
  {
    _id: '2',
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
    location: 'Kigali, Rwanda',
    seats: 5,
    condition: 'New',
    createdAt: new Date().toISOString()
  },
  {
    _id: '3',
    name: 'Audi A6 3.5',
    year: 2024,
    subtitle: '3.5 D5 PowerPulse Momentum 5dr AWD',
    image: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=600&h=400&fit=crop',
    price: 58000,
    mileage: 100,
    fuelType: 'Petrol',
    transmission: 'Automatic',
    make: 'Audi',
    location: 'Kigali, Rwanda',
    seats: 5,
    condition: 'New',
    createdAt: new Date().toISOString()
  },
  {
    _id: '4',
    name: 'Corolla Altis',
    year: 2023,
    subtitle: '3.5 D5 PowerPulse Momentum 5dr AWD',
    image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=600&h=400&fit=crop',
    price: 45000,
    mileage: 15000,
    fuelType: 'Petrol',
    transmission: 'Automatic',
    make: 'Toyota',
    location: 'Kigali, Rwanda',
    seats: 5,
    condition: 'Used',
    createdAt: new Date().toISOString()
  }
];

// Helper function to apply filters
function applyFilters(vehicles, search, make, year, sort) {
  let filtered = [...vehicles];

  // Apply search filter
  if (search) {
    filtered = filtered.filter(vehicle =>
      vehicle.name.toLowerCase().includes(search.toLowerCase()) ||
      vehicle.subtitle.toLowerCase().includes(search.toLowerCase()) ||
      vehicle.make.toLowerCase().includes(search.toLowerCase())
    );
  }

  // Apply make filter
  if (make) {
    filtered = filtered.filter(vehicle =>
      vehicle.make.toLowerCase().includes(make.toLowerCase())
    );
  }

  // Apply year filter
  if (year) {
    filtered = filtered.filter(vehicle => vehicle.year === parseInt(year));
  }

  // Apply sorting
  if (sort) {
    switch (sort) {
      case 'price_low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price_high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'year_new':
        filtered.sort((a, b) => b.year - a.year);
        break;
      case 'mileage':
        filtered.sort((a, b) => a.mileage - b.mileage);
        break;
      case 'newest':
      default:
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  }

  return filtered;
}

// Main handler function
export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === 'GET') {
      const { search, make, year, sort } = req.query;
      
      // Apply filters and sorting
      const filteredVehicles = applyFilters(mockVehicles, search, make, year, sort);
      
      res.status(200).json(filteredVehicles);
    } else if (req.method === 'POST') {
      // Handle POST requests (create new vehicle)
      const newVehicle = {
        _id: (mockVehicles.length + 1).toString(),
        ...req.body,
        createdAt: new Date().toISOString()
      };
      mockVehicles.push(newVehicle);
      res.status(201).json(newVehicle);
    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Error in vehicles API:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
