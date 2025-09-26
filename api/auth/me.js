// Vercel serverless function for getting current user
const cors = require('cors');

// Mock user data
const mockUsers = [
  {
    _id: '68d5491683ce5fa40a99954b',
    fullname: 'User One',
    email: 'user1@gmail.com',
    phone: '+250793373953',
    role: 'user',
    createdAt: new Date('2025-01-17T00:00:00Z'),
    updatedAt: new Date('2025-01-17T00:00:00Z')
  },
  {
    _id: '68d5498abc621c37fe2b5fab',
    fullname: 'Admin One',
    email: 'admin1@gmail.com',
    phone: '+250788881400',
    role: 'admin',
    createdAt: new Date('2025-01-17T00:00:00Z'),
    updatedAt: new Date('2025-01-17T00:00:00Z')
  }
];

export default function handler(req, res) {
  // Enable CORS
  cors()(req, res, () => {
    if (req.method !== 'GET') {
      return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
      // In a real app, you'd validate the JWT token from cookies/headers
      // For now, return a mock user (you can modify this based on your auth logic)
      const mockUser = mockUsers[0]; // Default to first user

      res.json({
        success: true,
        user: mockUser
      });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
}
