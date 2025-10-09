// Vercel serverless function for vehicles API
const cors = require('cors');

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
      const { 
        search, 
        make, 
        year, 
        sort, 
        page = 1, 
        limit = 10,
        q 
      } = req.query;
      
      // Apply filters and sorting
      let filteredVehicles = applyFilters(mockVehicles, search || q, make, year, sort);
      
      // Pagination
      const pageNum = Math.max(1, parseInt(String(page)));
      const limitNum = Math.max(1, Math.min(100, parseInt(String(limit))));
      const total = filteredVehicles.length;
      const totalPages = Math.ceil(total / limitNum);
      const startIndex = (pageNum - 1) * limitNum;
      const endIndex = startIndex + limitNum;
      const paginatedVehicles = filteredVehicles.slice(startIndex, endIndex);
      
      // Return paginated response
      res.status(200).json({
        data: {
          items: paginatedVehicles,
          total,
          page: pageNum,
          limit: limitNum,
          totalPages
        }
      });
    } else if (req.method === 'POST') {
      // Handle POST requests (create new vehicle)
      const newVehicle = {
        _id: (mockVehicles.length + 1).toString(),
        ...req.body,
        status: req.body.status || 'available',
        createdAt: new Date().toISOString()
      };
      mockVehicles.push(newVehicle);
      res.status(201).json({
        message: 'Vehicle created successfully',
        data: newVehicle
      });
    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Error in vehicles API:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
