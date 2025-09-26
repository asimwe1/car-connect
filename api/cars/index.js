// Vercel serverless function for cars API
const cors = require('cors');

// Mock car data - same as vehicles but with car-specific fields
const mockCars = [
  {
    _id: '1',
    make: 'Ford',
    model: 'Transit',
    name: 'Ford Transit',
    year: 2021,
    subtitle: '4.0 D5 PowerPulse Momentum 5dr AWD',
    image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600&h=400&fit=crop',
    price: 22000,
    mileage: 2500,
    fuelType: 'Diesel',
    transmission: 'Manual',
    badge: 'Great Price',
    location: 'Kigali, Rwanda',
    seats: 5,
    condition: 'Used',
    status: 'available',
    createdAt: new Date().toISOString()
  },
  {
    _id: '2',
    make: 'Mercedes Benz',
    model: 'GLC',
    name: 'New GLC',
    year: 2023,
    subtitle: '4.0 D5 PowerPulse Momentum 5dr AWD',
    image: 'https://images.unsplash.com/photo-1606016595464-d0b5c54a8f87?w=600&h=400&fit=crop',
    price: 95000,
    mileage: 50,
    fuelType: 'Petrol',
    transmission: 'Automatic',
    badge: 'Low Mileage',
    location: 'Kigali, Rwanda',
    seats: 5,
    condition: 'New',
    status: 'available',
    createdAt: new Date().toISOString()
  },
  {
    _id: '3',
    make: 'Audi',
    model: 'A6',
    name: 'Audi A6 3.5',
    year: 2024,
    subtitle: '3.5 D5 PowerPulse Momentum 5dr AWD',
    image: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=600&h=400&fit=crop',
    price: 58000,
    mileage: 100,
    fuelType: 'Petrol',
    transmission: 'Automatic',
    location: 'Kigali, Rwanda',
    seats: 5,
    condition: 'New',
    status: 'available',
    createdAt: new Date().toISOString()
  },
  {
    _id: '4',
    make: 'Toyota',
    model: 'Corolla Altis',
    name: 'Corolla Altis',
    year: 2023,
    subtitle: '3.5 D5 PowerPulse Momentum 5dr AWD',
    image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=600&h=400&fit=crop',
    price: 45000,
    mileage: 15000,
    fuelType: 'Petrol',
    transmission: 'Automatic',
    location: 'Kigali, Rwanda',
    seats: 5,
    condition: 'Used',
    status: 'available',
    createdAt: new Date().toISOString()
  }
];

// Helper function to apply filters
function applyFilters(cars, search, make, year, sort, status, minPrice, maxPrice) {
  let filtered = [...cars];

  // Apply search filter
  if (search) {
    filtered = filtered.filter(car =>
      car.name.toLowerCase().includes(search.toLowerCase()) ||
      car.subtitle.toLowerCase().includes(search.toLowerCase()) ||
      car.make.toLowerCase().includes(search.toLowerCase()) ||
      car.model.toLowerCase().includes(search.toLowerCase())
    );
  }

  // Apply make filter
  if (make) {
    filtered = filtered.filter(car =>
      car.make.toLowerCase().includes(make.toLowerCase())
    );
  }

  // Apply year filter
  if (year) {
    filtered = filtered.filter(car => car.year === parseInt(year));
  }

  // Apply status filter
  if (status) {
    filtered = filtered.filter(car => 
      car.status.toLowerCase() === status.toLowerCase()
    );
  }

  // Apply price range filters
  if (minPrice) {
    filtered = filtered.filter(car => car.price >= parseInt(minPrice));
  }
  if (maxPrice) {
    filtered = filtered.filter(car => car.price <= parseInt(maxPrice));
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
      
      // Apply filters and sorting
      let filteredCars = applyFilters(
        mockCars, 
        search || q, 
        make, 
        year, 
        sort, 
        status, 
        minPrice, 
        maxPrice
      );
      
      // Pagination
      const pageNum = Math.max(1, parseInt(String(page)));
      const limitNum = Math.max(1, Math.min(100, parseInt(String(limit))));
      const total = filteredCars.length;
      const totalPages = Math.ceil(total / limitNum);
      const startIndex = (pageNum - 1) * limitNum;
      const endIndex = startIndex + limitNum;
      const paginatedCars = filteredCars.slice(startIndex, endIndex);
      
      // Return paginated response
      res.status(200).json({
        data: {
          items: paginatedCars,
          total,
          page: pageNum,
          limit: limitNum,
          totalPages
        }
      });
    } else if (req.method === 'POST') {
      // Handle POST requests (create new car)
      const { make, model, year, price, transmission } = req.body;
      
      // Validate required fields
      if (!make || !model || !year || !price || !transmission) {
        return res.status(400).json({ 
          message: 'Missing required fields: make, model, year, price, transmission' 
        });
      }

      const newCar = {
        _id: (mockCars.length + 1).toString(),
        ...req.body,
        name: req.body.name || `${make} ${model}`,
        status: req.body.status || 'available',
        createdAt: new Date().toISOString()
      };
      mockCars.push(newCar);
      res.status(201).json({
        message: 'Car created successfully',
        data: newCar
      });
    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Error in cars API:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
