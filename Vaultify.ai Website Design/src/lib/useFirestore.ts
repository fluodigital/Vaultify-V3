import { useState, useEffect } from 'react';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';

// Booking interface
export interface Booking {
  id?: string;
  userId: string;
  type: 'jet' | 'yacht' | 'hotel' | 'villa' | 'experience' | 'watch' | 'car';
  title: string;
  description: string;
  price: number;
  currency: string;
  paymentMethod: 'card' | 'wire' | 'crypto';
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: any;
  bookingDate?: string;
  details: Record<string, any>;
}

// Conversation interface
export interface Conversation {
  id?: string;
  userId: string;
  title: string;
  lastMessage: string;
  status: 'active' | 'completed' | 'pending';
  createdAt: any;
  updatedAt: any;
  messages: Message[];
}

export interface Message {
  id: string;
  conversationId: string;
  userId: string;
  isUser: boolean;
  text: string;
  timestamp: any;
}

// Access request interface
export interface AccessRequest {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: any;
}

// Hook to get user's bookings
export function useBookings(userId: string | undefined) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) {
      setBookings([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'bookings'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const bookingsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Booking[];
        setBookings(bookingsData);
        setLoading(false);
      },
      (err) => {
        setError(err as Error);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [userId]);

  return { bookings, loading, error };
}

// Hook to get user's conversations
export function useConversations(userId: string | undefined) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) {
      setConversations([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'conversations'),
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const conversationsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Conversation[];
        setConversations(conversationsData);
        setLoading(false);
      },
      (err) => {
        setError(err as Error);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [userId]);

  return { conversations, loading, error };
}

// Create a new booking
export async function createBooking(booking: Omit<Booking, 'id' | 'createdAt'>) {
  const docRef = await addDoc(collection(db, 'bookings'), {
    ...booking,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

// Update booking status
export async function updateBookingStatus(bookingId: string, status: Booking['status']) {
  await updateDoc(doc(db, 'bookings', bookingId), {
    status,
    updatedAt: serverTimestamp(),
  });
}

// Create access request
export async function createAccessRequest(request: Omit<AccessRequest, 'id' | 'createdAt' | 'status'>) {
  const docRef = await addDoc(collection(db, 'accessRequests'), {
    ...request,
    status: 'pending',
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

// Create a new conversation
export async function createConversation(userId: string, title: string, initialMessage: string) {
  const docRef = await addDoc(collection(db, 'conversations'), {
    userId,
    title,
    lastMessage: initialMessage,
    status: 'active',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    messages: [],
  });
  return docRef.id;
}

// Add message to conversation
export async function addMessageToConversation(
  conversationId: string,
  userId: string,
  isUser: boolean,
  text: string
) {
  const conversationRef = doc(db, 'conversations', conversationId);
  const conversationDoc = await getDoc(conversationRef);
  
  if (conversationDoc.exists()) {
    const messages = conversationDoc.data().messages || [];
    const newMessage = {
      id: `msg_${Date.now()}`,
      conversationId,
      userId,
      isUser,
      text,
      timestamp: Timestamp.now(),
    };

    await updateDoc(conversationRef, {
      messages: [...messages, newMessage],
      lastMessage: text,
      updatedAt: serverTimestamp(),
    });
  }
}
