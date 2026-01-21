import * as functions from 'firebase-functions';
import { randomUUID } from 'crypto';
import { generatePlan, synthesizeFinalMessage } from './alfred/openaiClient';
import { detectPromptInjection } from './alfred/policy';
import { executeTool, sanitizeToolResult } from './alfred/toolRouter';
import { getSessionMemory, saveSessionMemory, summarizeMemory } from './alfred/memory';
import { AlfredPlan, ToolCall } from './alfred/types';


const limiter = new Map<string, { count: number; windowStart: number }>();
const WINDOW_MS = 60_000;
const MAX_REQ = 20;
const irreversibleTools = new Set(['create_booking_draft', 'cancel_booking', 'request_vendor_checkout']);

function rateLimit(key: string) {
  const now = Date.now();
  const entry = limiter.get(key) || { count: 0, windowStart: now };
  if (now - entry.windowStart > WINDOW_MS) {
    entry.count = 0;
    entry.windowStart = now;
  }
  entry.count += 1;
  limiter.set(key, entry);
  return entry.count <= MAX_REQ;
}

function parseBody(req: functions.https.Request) {
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body); } catch (e) { return {}; }
  }
  return req.body || {};
}

function cors(res: functions.Response) {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
}

async function runToolsIfAllowed(toolCalls: ToolCall[], context: { correlationId: string; userId?: string; sessionId?: string; confirmed: boolean }) {
  const results: Record<string, any>[] = [];
  for (const call of toolCalls.slice(0, 3)) {
    if (!context.confirmed && irreversibleTools.has(call.tool as any)) {
      continue;
    }
    const output = await executeTool(call, context);
    results.push({ tool: call.tool, output: sanitizeToolResult(output) });
  }
  return results;
}

async function handleChat(req: functions.https.Request, res: functions.Response): Promise<void> {
  cors(res);
  if (req.method === 'OPTIONS') { res.status(204).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }

  const body = parseBody(req);
  const { sessionId, userId, message, context } = body as { sessionId?: string; userId?: string; message?: string; context?: any };
  if (!message) { res.status(400).json({ error: 'message required' }); return; }

  const ip = (req.headers['x-forwarded-for'] as string) || req.ip || 'unknown';
  if (!rateLimit(`${ip}:${sessionId || 'anon'}`)) { res.status(429).json({ error: 'rate_limited' }); return; }

  const correlationId = randomUUID();
  const injection = detectPromptInjection(message);
  if (injection.flagged && injection.severity === 'high') {
    res.json({ message: 'I can help with travel and lifestyle, but I cannot follow that instruction.', pendingConfirmation: false, debugId: correlationId }); return;
  }

  const memory = await getSessionMemory(sessionId || 'default', userId);
  const memorySummary = summarizeMemory(memory);

  let plan: AlfredPlan;
  try {
    const { plan: generated } = await generatePlan({ userMessage: message, memorySummary, intentHint: context?.intent });
    plan = generated;
  } catch (err) {
    functions.logger.error('plan_generation_failed', { correlationId, err: String(err) });
    res.status(500).json({ error: 'plan_failed', debugId: correlationId }); return;
  }

  const needsConfirmation = plan.proposed_action?.confirmationRequired === true;
  if (needsConfirmation) {
    await saveSessionMemory(sessionId || 'default', { ...memory, pendingAction: plan.proposed_action }, userId);
    res.json({
      message: plan.user_visible_message,
      pendingConfirmation: true,
      debugId: correlationId,
    });
    return;
  }

  const toolCalls = plan.recommended_next_tool_calls || [];
  let toolResults: Record<string, any>[] = [];
  try {
    toolResults = await runToolsIfAllowed(toolCalls, { correlationId, userId, sessionId, confirmed: true });
  } catch (err) {
    functions.logger.error('tool_failed', { correlationId, err: String(err) });
  }

  if (toolResults.length && toolResults[0]?.tool === 'search_listings') {
    memory.lastShortlist = toolResults[0].output?.results;
  }
  memory.pendingAction = null;
  await saveSessionMemory(sessionId || 'default', memory, userId);

  const finalMessage = await synthesizeFinalMessage({ userMessage: message, plan, toolCalls, toolResults });

  res.json({ message: finalMessage, debugId: correlationId, pendingConfirmation: false, uiHints: { intent: plan.intent } });
  return;
}

async function handleConfirm(req: functions.https.Request, res: functions.Response): Promise<void> {
  cors(res);
  if (req.method === 'OPTIONS') { res.status(204).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }

  const body = parseBody(req);
  const { sessionId, userId, confirm } = body as { sessionId?: string; userId?: string; confirm?: boolean };
  if (!sessionId) { res.status(400).json({ error: 'sessionId required' }); return; }

  const correlationId = randomUUID();
  const memory = await getSessionMemory(sessionId, userId);
  const pending = memory.pendingAction;
  if (!pending) { res.status(400).json({ error: 'no pending action', debugId: correlationId }); return; }
  if (!confirm) { res.json({ message: 'I will hold that request until you confirm.', pendingConfirmation: true, debugId: correlationId }); return; }

  const toolCalls = pending.toolCalls || [];
  let toolResults: Record<string, any>[] = [];
  try {
    toolResults = await runToolsIfAllowed(toolCalls, { correlationId, userId, sessionId, confirmed: true });
  } catch (err) {
    functions.logger.error('confirm_tool_failed', { correlationId, err: String(err) });
  }

  memory.pendingAction = null;
  await saveSessionMemory(sessionId, memory, userId);

  res.json({ message: 'Done. I executed the requested action and will monitor status.', debugId: correlationId, toolResults });
  return;
}

export const alfredChatApi = functions.https.onRequest(handleChat);
export const alfredConfirmApi = functions.https.onRequest(handleConfirm);
