// Vercel serverless function for user logout
const cors = require('cors');

export default function handler(req, res) {
  // Enable CORS
  cors()(req, res, () => {
    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
      // In a real app, you'd invalidate the JWT token
      // For now, just return success
      res.json({ message: 'Logged out' });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
}
