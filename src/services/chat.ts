// Mock chat service - Firebase functionality removed
// This is a placeholder implementation for development

export interface ChatMessage {
  id?: string;
  roomId: string;
  senderId: string;
  senderName?: string;
  content: string;
  createdAt?: any;
}

export interface ChatRoom {
  id?: string;
  userId: string;
  supportId?: string;
  lastMessage?: string;
  updatedAt?: any;
}

// Mock implementations that do nothing
export async function ensureUserRoom(userId: string): Promise<string> {
  console.log('Mock ensureUserRoom called for user:', userId);
  return `mock-room-${userId}`;
}

export function subscribeToMessages(roomId: string, cb: (messages: ChatMessage[]) => void) {
  console.log('Mock subscribeToMessages called for room:', roomId);
  // Return a mock unsubscribe function
  return () => console.log('Mock unsubscribe called');
}

export async function sendMessage(roomId: string, payload: Omit<ChatMessage, 'createdAt' | 'roomId'>) {
  console.log('Mock sendMessage called:', { roomId, payload });
  // Mock implementation - does nothing
}

export function subscribeToAllRoomsForSupport(cb: (rooms: ChatRoom[]) => void) {
  console.log('Mock subscribeToAllRoomsForSupport called');
  // Return a mock unsubscribe function
  return () => console.log('Mock unsubscribe called');
}
