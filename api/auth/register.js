// Vercel serverless function for user registration
const cors = require('cors');

export default function handler(req, res) {
  // Enable CORS
  cors()(req, res, () => {
    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
      const { fullname, phone, password } = req.body;

      if (!fullname || !phone || !password) {
        return res.status(400).json({ message: 'Full name, phone, and password are required' });
      }

      // Validate phone number format
      const phoneRegex = /^\+?[1-9]\d{1,14}$/;
      if (!phoneRegex.test(phone)) {
        return res.status(400).json({ message: 'Invalid phone number format' });
      }

      // Mock registration - in real app, you'd save to database
      // For now, just return success and indicate OTP was sent
      console.log('Mock registration:', { fullname, phone });

      res.status(201).json({
        message: 'Proceed to check your phone for OTP',
        success: true,
        otpSent: true
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
}
