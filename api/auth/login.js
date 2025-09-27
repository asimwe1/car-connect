// Vercel serverless function for user login
const cors = require('cors');

// Mock user data for testing
const mockUsers = [
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

export default function handler(req, res) {
  // Enable CORS
  cors()(req, res, () => {
    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
      const { phone, password } = req.body;

      if (!phone || !password) {
        return res.status(400).json({ message: 'Phone and password are required' });
      }

      // Find user by phone
      const user = mockUsers.find(u => u.phone === phone);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
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
}
