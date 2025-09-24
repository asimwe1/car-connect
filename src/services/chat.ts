import { db } from '@/lib/firebase';
import {
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  orderBy,
  query,
  doc,
  setDoc,
  getDoc,
  updateDoc,
} from 'firebase/firestore';

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

const roomsCol = collection(db, 'supportRooms');

export async function ensureUserRoom(userId: string): Promise<string> {
  const roomRef = doc(db, 'supportRooms', userId);
  const snap = await getDoc(roomRef);
  if (!snap.exists()) {
    await setDoc(roomRef, {
      userId,
      updatedAt: serverTimestamp(),
    } as ChatRoom);
  }
  return roomRef.id;
}

export function subscribeToMessages(roomId: string, cb: (messages: ChatMessage[]) => void) {
  const q = query(collection(db, 'supportRooms', roomId, 'messages'), orderBy('createdAt', 'asc'));
  return onSnapshot(q, (snap) => {
    const out: ChatMessage[] = [];
    snap.forEach((d) => out.push({ id: d.id, ...(d.data() as ChatMessage) }));
    cb(out);
  });
}

export async function sendMessage(roomId: string, payload: Omit<ChatMessage, 'createdAt' | 'roomId'>) {
  await addDoc(collection(db, 'supportRooms', roomId, 'messages'), {
    ...payload,
    roomId,
    createdAt: serverTimestamp(),
  } as ChatMessage);

  await updateDoc(doc(db, 'supportRooms', roomId), {
    lastMessage: payload.content,
    updatedAt: serverTimestamp(),
  });
}

export function subscribeToAllRoomsForSupport(cb: (rooms: ChatRoom[]) => void) {
  const q = query(roomsCol, orderBy('updatedAt', 'desc'));
  return onSnapshot(q, (snap) => {
    const out: ChatRoom[] = [];
    snap.forEach((d) => out.push({ id: d.id, ...(d.data() as ChatRoom) }));
    cb(out);
  });
}


