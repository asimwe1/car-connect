// Vercel serverless function for OTP verification
const cors = require('cors');

export default function handler(req, res) {
  // Enable CORS
  cors()(req, res, () => {
    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
      const { phone, otpCode } = req.body;

      if (!phone || !otpCode) {
        return res.status(400).json({ message: 'Phone and OTP are required' });
      }

      // For testing, accept '123456' for any phone number
      if (otpCode === '123456') {
        return res.json({
          success: true,
          message: 'Registration successful',
          otpVerified: true
        });
      }

      return res.status(400).json({ message: 'Invalid OTP' });
    } catch (error) {
      console.error('OTP verification error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
}
