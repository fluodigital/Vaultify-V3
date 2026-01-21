import * as admin from 'firebase-admin';
import { SessionMemory } from './types';
import { redactPII } from './policy';

const db = admin.firestore();
const fallbackMemory = new Map<string, SessionMemory>();

export async function getSessionMemory(sessionId: string, userId?: string): Promise<SessionMemory> {
  if (!sessionId) return {};
  try {
    const ref = db.collection('alfredSessions').doc(sessionId);
    const snap = await ref.get();
    if (snap.exists) {
      const data = snap.data() as SessionMemory & { userId?: string };
      if (userId && data.userId && data.userId !== userId) return {};
      return {
        userPreferences: data.userPreferences || {},
        currentTripContext: data.currentTripContext || {},
        pendingAction: data.pendingAction || null,
        lastShortlist: data.lastShortlist,
      };
    }
  } catch (err) {
    // Fallback to in-memory if Firestore unavailable
  }
  return fallbackMemory.get(sessionId) || {};
}

export async function saveSessionMemory(sessionId: string, memory: SessionMemory, userId?: string) {
  if (!sessionId) return;
  const sanitized: SessionMemory & { userId?: string } = {
    userId,
    userPreferences: memory.userPreferences || {},
    currentTripContext: memory.currentTripContext || {},
    pendingAction: memory.pendingAction || null,
    lastShortlist: memory.lastShortlist,
  };

  try {
    const ref = db.collection('alfredSessions').doc(sessionId);
    await ref.set(sanitized, { merge: true });
  } catch (err) {
    fallbackMemory.set(sessionId, sanitized);
  }
}

export function summarizeMemory(memory: SessionMemory) {
  const prefs = memory.userPreferences ? JSON.stringify(memory.userPreferences).slice(0, 400) : '';
  const ctx = memory.currentTripContext ? JSON.stringify(memory.currentTripContext).slice(0, 400) : '';
  return {
    userPreferences: prefs ? redactPII(prefs) : undefined,
    currentTripContext: ctx ? redactPII(ctx) : undefined,
    pendingAction: memory.pendingAction,
    lastShortlist: memory.lastShortlist ? '[cached shortlist]' : undefined,
  };
}
