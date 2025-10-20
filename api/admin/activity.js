// Admin Activity API endpoint
// GET /api/admin/activity - Get recent activities
// POST /api/admin/activity - Create new activity

export default async function handler(req, res) {
  const { method } = req;

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    switch (method) {
      case 'GET':
        return await getActivities(req, res);
      case 'POST':
        return await createActivity(req, res);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Activity API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function getActivities(req, res) {
  try {
    // Get query parameters
    const { limit = 50, type, priority } = req.query;
    
    // Mock data for now - in production, this would come from a database
    const mockActivities = [
      {
        id: `activity-${Date.now()}`,
        type: 'car_view',
        message: 'Car viewed by visitor',
        timestamp: new Date().toISOString(),
        priority: 'medium',
        metadata: {
          carId: 'car-123',
          userId: null
        }
      },
      {
        id: `activity-${Date.now() - 1000}`,
        type: 'new_user',
        message: 'New user registered: John Doe',
        timestamp: new Date(Date.now() - 300000).toISOString(),
        priority: 'medium',
        metadata: {
          userId: 'user-456',
          userInfo: {
            fullname: 'John Doe',
            phone: '+1234567890'
          }
        }
      },
      {
        id: `activity-${Date.now() - 2000}`,
        type: 'booking',
        message: 'New test drive booking created',
        timestamp: new Date(Date.now() - 600000).toISOString(),
        priority: 'high',
        metadata: {
          bookingId: 'booking-789',
          carId: 'car-123',
          userId: 'user-456'
        }
      },
      {
        id: `activity-${Date.now() - 3000}`,
        type: 'message',
        message: 'New message sent',
        timestamp: new Date(Date.now() - 900000).toISOString(),
        priority: 'high',
        metadata: {
          messageId: 'msg-101',
          senderId: 'user-456',
          recipientId: 'admin-001'
        }
      },
      {
        id: `activity-${Date.now() - 4000}`,
        type: 'order',
        message: 'New order created for $25,000',
        timestamp: new Date(Date.now() - 1200000).toISOString(),
        priority: 'high',
        metadata: {
          orderId: 'order-202',
          carId: 'car-123',
          userId: 'user-456',
          amount: 25000
        }
      }
    ];

    // Filter activities based on query parameters
    let filteredActivities = mockActivities;

    if (type) {
      filteredActivities = filteredActivities.filter(activity => activity.type === type);
    }

    if (priority) {
      filteredActivities = filteredActivities.filter(activity => activity.priority === priority);
    }

    // Limit results
    const limitedActivities = filteredActivities.slice(0, parseInt(limit));

    return res.status(200).json(limitedActivities);
  } catch (error) {
    console.error('Error fetching activities:', error);
    return res.status(500).json({ error: 'Failed to fetch activities' });
  }
}

async function createActivity(req, res) {
  try {
    const { type, message, priority = 'medium', metadata = {} } = req.body;

    if (!type || !message) {
      return res.status(400).json({ error: 'Type and message are required' });
    }

    // Create new activity
    const newActivity = {
      id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      message,
      timestamp: new Date().toISOString(),
      priority,
      metadata
    };

    // In production, save to database here
    console.log('New activity created:', newActivity);

    return res.status(201).json(newActivity);
  } catch (error) {
    console.error('Error creating activity:', error);
    return res.status(500).json({ error: 'Failed to create activity' });
  }
}
