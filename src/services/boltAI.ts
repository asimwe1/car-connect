// Bolt AI Integration Service
// This service integrates with Bolt AI for intelligent chat responses

interface BoltAIResponse {
  response: string;
  confidence: number;
  suggestions?: string[];
}

interface SystemContext {
  totalUsers: number;
  totalCars: number;
  totalOrders: number;
  activeBookings: number;
  recentActivity?: string[];
}

class BoltAIService {
  private apiKey: string;
  private baseURL: string;

  constructor() {
    // In production, these would come from environment variables
    this.apiKey = import.meta.env.VITE_BOLT_AI_API_KEY || 'demo-key';
    this.baseURL = import.meta.env.VITE_BOLT_AI_BASE_URL || 'https://api.bolt.new/v1';
  }

  async generateResponse(
    userMessage: string, 
    systemContext: SystemContext,
    isAdmin: boolean = false
  ): Promise<BoltAIResponse> {
    try {
      // Enhanced prompt with system context
      const systemPrompt = this.buildSystemPrompt(systemContext, isAdmin);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout for fast responses

      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'bolt-1',
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: userMessage
            }
          ],
          max_tokens: 150, // Reduced for faster responses
          temperature: 0.7,
          stream: false,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Bolt AI API error: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.choices[0]?.message?.content || this.getFallbackResponse(userMessage, systemContext);

      return {
        response: aiResponse,
        confidence: 0.9,
        suggestions: this.generateSuggestions(userMessage, systemContext)
      };
    } catch (error) {
      if (error.name === 'AbortError') {
        console.warn("Bolt AI request timed out, using fallback");
        return {
          response: this.getFallbackResponse(userMessage, systemContext),
          confidence: 0.3,
          suggestions: this.generateSuggestions(userMessage, systemContext)
        };
      }
      console.error('Bolt AI integration error:', error);
      return {
        response: this.getFallbackResponse(userMessage, systemContext),
        confidence: 0.5,
        suggestions: this.generateSuggestions(userMessage, systemContext)
      };
    }
  }

  private buildSystemPrompt(context: SystemContext, isAdmin: boolean): string {
    const basePrompt = `You are CarConnect's AI assistant. You help users with car-related questions and provide support.

Current System Status:
- Total Users: ${context.totalUsers}
- Total Cars: ${context.totalCars}
- Total Orders: ${context.totalOrders}
- Active Bookings: ${context.activeBookings}

You can help with:
- Car availability and pricing
- Test drive bookings
- Payment and financing options
- Account management
- General platform questions

Be helpful, friendly, and professional. If you don't know something, suggest contacting human support.`;

    if (isAdmin) {
      return basePrompt + `

ADMIN MODE: You have access to system data and can provide more detailed information about:
- User statistics and trends
- System performance
- Administrative tasks
- Advanced troubleshooting

Always maintain professionalism and data privacy.`;
    }

    return basePrompt;
  }

  private getFallbackResponse(userMessage: string, context: SystemContext): string {
    const lowerMessage = userMessage.toLowerCase();
    
    // Car availability questions
    if (lowerMessage.includes('available') || lowerMessage.includes('availability')) {
      return `We currently have ${context.totalCars} cars available in our inventory. You can browse all available vehicles in our 'Buy Cars' section. Each listing shows real-time availability status.`;
    }
    
    // User statistics
    if (lowerMessage.includes('users') || lowerMessage.includes('customers')) {
      return `Our platform currently serves ${context.totalUsers} registered users. We're growing every day with new car enthusiasts joining our community!`;
    }
    
    // Orders and sales
    if (lowerMessage.includes('orders') || lowerMessage.includes('sales')) {
      return `We've processed ${context.totalOrders} orders successfully. Our platform facilitates secure transactions between buyers and sellers.`;
    }
    
    // Bookings
    if (lowerMessage.includes('booking') || lowerMessage.includes('test drive')) {
      return `We have ${context.activeBookings} active test drive bookings. You can schedule a test drive for any available vehicle through our booking system.`;
    }
    
    // Default response
    return `I'd be happy to help you with that! Our platform currently has ${context.totalCars} cars available, serves ${context.totalUsers} users, and has processed ${context.totalOrders} orders. For specific questions, please feel free to ask or contact our human support team.`;
  }

  private generateSuggestions(userMessage: string, context: SystemContext): string[] {
    const suggestions: string[] = [];
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('car') || lowerMessage.includes('vehicle')) {
      suggestions.push('Browse available cars', 'Schedule a test drive', 'Check car specifications');
    }
    
    if (lowerMessage.includes('price') || lowerMessage.includes('cost')) {
      suggestions.push('View pricing details', 'Check financing options', 'Compare similar cars');
    }
    
    if (lowerMessage.includes('account') || lowerMessage.includes('profile')) {
      suggestions.push('Update profile', 'View order history', 'Manage notifications');
    }
    
    // Always include general suggestions
    suggestions.push('Contact human support', 'View FAQ', 'Check system status');
    
    return suggestions.slice(0, 3); // Return top 3 suggestions
  }

  async analyzeSystemHealth(): Promise<{
    status: 'healthy' | 'warning' | 'critical';
    issues: string[];
    recommendations: string[];
  }> {
    try {
      // This would integrate with Bolt AI to analyze system metrics
      const issues: string[] = [];
      const recommendations: string[] = [];
      
      // Basic health checks
      if (this.apiKey === 'demo-key') {
        issues.push('Using demo API key');
        recommendations.push('Configure production Bolt AI API key');
      }
      
      return {
        status: issues.length === 0 ? 'healthy' : 'warning',
        issues,
        recommendations
      };
    } catch (error) {
      return {
        status: 'critical',
        issues: ['Bolt AI service unavailable'],
        recommendations: ['Check API configuration', 'Verify network connectivity']
      };
    }
  }
}

// Export singleton instance
export const boltAI = new BoltAIService();
export type { BoltAIResponse, SystemContext };
