const express = require('express');
const router = express.Router();

// Mock data for development - in production this would connect to your database
let conversations = [];
let messages = [];
let messageIdCounter = 1;

// Middleware to simulate authentication
const authenticate = (req, res, next) => {
  // In production, this would verify JWT token
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  // Mock user extraction from token
  req.user = {
    id: 'mock-user-id',
    fullname: 'Mock User',
    phone: '+1234567890',
    role: 'user'
  };
  
  next();
};

// GET /api/messages/conversations - Get all conversations for the current user
router.get('/conversations', authenticate, async (req, res) => {
  try {
    // In production, fetch from database
    // SELECT * FROM conversations WHERE user_id = ? OR recipient_id = ?
    const userConversations = conversations.filter(conv => 
      conv.userId === req.user.id || conv.recipientId === req.user.id
    );

    // Format conversations with last message and unread count
    const formattedConversations = userConversations.map(conv => {
      const conversationMessages = messages.filter(msg => 
        msg.conversationId === conv.id
      ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      const unreadCount = conversationMessages.filter(msg => 
        !msg.isRead && msg.senderId !== req.user.id
      ).length;

      return {
        _id: conv.id,
        userId: conv.userId === req.user.id ? conv.recipientId : conv.userId,
        carId: conv.carId,
        otherUser: {
          _id: conv.userId === req.user.id ? conv.recipientId : conv.userId,
          fullname: conv.userId === req.user.id ? conv.recipientName : conv.userName,
          phone: conv.userId === req.user.id ? conv.recipientPhone : conv.userPhone
        },
        car: conv.car,
        lastMessage: conversationMessages[0] || null,
        unreadCount,
        updatedAt: conv.updatedAt
      };
    });

    res.json(formattedConversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// GET /api/messages/:carId/:recipientId - Get messages between current user and another user for a specific car
router.get('/:carId/:recipientId', authenticate, async (req, res) => {
  try {
    const { carId, recipientId } = req.params;
    
    // In production, fetch from database
    // SELECT * FROM messages WHERE 
    // (sender_id = ? AND recipient_id = ? AND car_id = ?) OR 
    // (sender_id = ? AND recipient_id = ? AND car_id = ?)
    // ORDER BY created_at ASC
    
    const conversationMessages = messages.filter(msg => 
      msg.carId === carId &&
      ((msg.senderId === req.user.id && msg.recipientId === recipientId) ||
       (msg.senderId === recipientId && msg.recipientId === req.user.id))
    ).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    // Format messages for frontend
    const formattedMessages = conversationMessages.map(msg => ({
      _id: msg.id,
      content: msg.content,
      sender: {
        _id: msg.senderId,
        fullname: msg.senderName,
        phone: msg.senderPhone
      },
      recipient: {
        _id: msg.recipientId,
        fullname: msg.recipientName,
        phone: msg.recipientPhone
      },
      car: msg.car,
      isRead: msg.isRead,
      createdAt: msg.createdAt,
      updatedAt: msg.updatedAt
    }));

    res.json(formattedMessages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// POST /api/messages - Send a new message
router.post('/', authenticate, async (req, res) => {
  try {
    const { recipientId, carId, content } = req.body;

    if (!recipientId || !carId || !content) {
      return res.status(400).json({ 
        error: 'recipientId, carId, and content are required' 
      });
    }

    // In production, you would:
    // 1. Validate that the car exists
    // 2. Validate that the recipient exists
    // 3. Check permissions (user can message about this car)
    // 4. Insert into database

    // Create new message
    const newMessage = {
      id: `msg_${messageIdCounter++}`,
      senderId: req.user.id,
      recipientId,
      carId,
      content,
      isRead: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // Mock additional data - in production fetch from database
      senderName: req.user.fullname,
      senderPhone: req.user.phone,
      recipientName: 'Mock Recipient',
      recipientPhone: '+0987654321',
      car: {
        _id: carId,
        make: 'Toyota',
        model: 'Camry',
        year: 2023,
        price: 25000,
        primaryImage: '/placeholder.svg'
      }
    };

    messages.push(newMessage);

    // Create or update conversation
    let conversation = conversations.find(conv => 
      conv.carId === carId &&
      ((conv.userId === req.user.id && conv.recipientId === recipientId) ||
       (conv.userId === recipientId && conv.recipientId === req.user.id))
    );

    if (!conversation) {
      conversation = {
        id: `conv_${conversations.length + 1}`,
        userId: req.user.id,
        recipientId,
        carId,
        userName: req.user.fullname,
        userPhone: req.user.phone,
        recipientName: 'Mock Recipient',
        recipientPhone: '+0987654321',
        car: newMessage.car,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      conversations.push(conversation);
    } else {
      conversation.updatedAt = new Date().toISOString();
    }

    // Format response message
    const responseMessage = {
      _id: newMessage.id,
      content: newMessage.content,
      sender: {
        _id: newMessage.senderId,
        fullname: newMessage.senderName,
        phone: newMessage.senderPhone
      },
      recipient: {
        _id: newMessage.recipientId,
        fullname: newMessage.recipientName,
        phone: newMessage.recipientPhone
      },
      car: newMessage.car,
      isRead: newMessage.isRead,
      createdAt: newMessage.createdAt,
      updatedAt: newMessage.updatedAt
    };

    res.status(201).json({
      success: true,
      message: responseMessage
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// POST /api/messages/mark-read - Mark messages as read
router.post('/mark-read', authenticate, async (req, res) => {
  try {
    const { messageIds } = req.body;

    if (!Array.isArray(messageIds) || messageIds.length === 0) {
      return res.status(400).json({ 
        error: 'messageIds must be a non-empty array' 
      });
    }

    // In production, update database
    // UPDATE messages SET is_read = true, updated_at = NOW() 
    // WHERE id IN (?) AND recipient_id = ?

    let updatedCount = 0;
    messages.forEach(msg => {
      if (messageIds.includes(msg.id) && msg.recipientId === req.user.id) {
        msg.isRead = true;
        msg.updatedAt = new Date().toISOString();
        updatedCount++;
      }
    });

    res.json({
      success: true,
      updatedCount,
      message: `${updatedCount} messages marked as read`
    });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ error: 'Failed to mark messages as read' });
  }
});

// Admin endpoint to get all conversations (for support)
router.get('/admin/conversations', authenticate, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // In production, fetch all conversations from database
    const allConversations = conversations.map(conv => {
      const conversationMessages = messages.filter(msg => 
        msg.conversationId === conv.id
      ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      return {
        _id: conv.id,
        userId: conv.userId,
        carId: conv.carId,
        otherUser: {
          _id: conv.userId,
          fullname: conv.userName,
          phone: conv.userPhone
        },
        car: conv.car,
        lastMessage: conversationMessages[0] || null,
        unreadCount: conversationMessages.filter(msg => !msg.isRead).length,
        updatedAt: conv.updatedAt
      };
    });

    res.json(allConversations);
  } catch (error) {
    console.error('Error fetching admin conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

module.exports = router;
