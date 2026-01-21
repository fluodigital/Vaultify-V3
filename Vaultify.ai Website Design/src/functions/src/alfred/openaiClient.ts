import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { AlfredPlan, AlfredPlanSchema, ToolCall } from "./types";
import { detectPromptInjection } from './policy';

const systemPrompt = fs.readFileSync(path.join(__dirname, 'prompts', 'system.md'), 'utf8');
const developerPrompt = fs.readFileSync(path.join(__dirname, 'prompts', 'developer.md'), 'utf8');
const refusalPrompt = fs.readFileSync(path.join(__dirname, 'prompts', 'refusal.md'), 'utf8');

const apiKey = process.env.OPENAI_API_KEY;
const client = apiKey ? new OpenAI({ apiKey }) : null;
const DEFAULT_MODEL = process.env.ALFRED_MODEL || 'gpt-4.1-mini';


const planJsonSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    intent: { type: 'string', enum: ['browse', 'plan', 'book', 'cancel', 'support', 'unknown'] },
    missing_info_questions: { type: 'array', items: { type: 'string' }, default: [] },
    recommended_next_tool_calls: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          tool: { type: 'string', enum: ['search_listings', 'get_listing_details', 'get_offers', 'create_booking_draft', 'request_vendor_checkout', 'get_booking_status', 'cancel_booking', 'save_user_preferences'] },
          args: { type: 'object', additionalProperties: true, default: {} },
        },
        required: ['tool'],
      },
      default: [],
    },
    user_visible_message: { type: 'string' },
    proposed_action: {
      type: 'object',
      additionalProperties: false,
      properties: {
        action: { type: 'string' },
        confirmationRequired: { type: 'boolean', default: false },
        summary: { type: 'string' },
        bookingId: { type: 'string' },
        toolCalls: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              tool: { type: 'string' },
              args: { type: 'object', additionalProperties: true, default: {} },
            },
            required: ['tool'],
          },
        },
      },
      required: ['action', 'confirmationRequired'],
    },
  },
  required: ['intent', 'user_visible_message'],
};
export type PlanRequest = {
  userMessage: string;
  memorySummary?: Record<string, any>;
  intentHint?: string;
};

export async function generatePlan(request: PlanRequest): Promise<{ plan: AlfredPlan; raw: any }> {
  const { userMessage, memorySummary, intentHint } = request;
  const injection = detectPromptInjection(userMessage);
  if (injection.flagged && injection.severity === 'high') {
    return {
      plan: {
        intent: 'support',
        missing_info_questions: [],
        recommended_next_tool_calls: [],
        user_visible_message: refusalPrompt.trim(),
      },
      raw: null,
    };
  }

  const contentBlocks = [
    { role: 'system' as const, content: systemPrompt },
    { role: 'system' as const, content: developerPrompt },
    { role: 'user' as const, content: intentHint ? `Intent hint: ${intentHint}` : '' },
    {
      role: 'user' as const,
      content: JSON.stringify({ message: userMessage, memory: memorySummary || {} }),
    },
  ];

  if (!client || !apiKey) {
    return { plan: { intent: 'support', missing_info_questions: [], recommended_next_tool_calls: [], user_visible_message: refusalPrompt.trim() }, raw: null };
  }

  const completion = await client.chat.completions.create({
    model: DEFAULT_MODEL,
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'alfred_plan',
        schema: planJsonSchema,
        strict: true,
      },
    },
    messages: contentBlocks,
    temperature: 0.3,
  });

  const raw = completion.choices[0]?.message?.content;
  const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
  const plan = AlfredPlanSchema.parse(parsed);
  return { plan, raw };
}

export async function synthesizeFinalMessage(params: {
  userMessage: string;
  plan: AlfredPlan;
  toolCalls?: ToolCall[];
  toolResults?: Record<string, any>[];
}) {
  const { userMessage, plan, toolCalls = [], toolResults = [] } = params;
  const input = [
    { role: 'system' as const, content: systemPrompt },
    { role: 'system' as const, content: developerPrompt },
    {
      role: 'user' as const,
      content: JSON.stringify({ userMessage, plan, toolCalls, toolResults }),
    },
    { role: 'system' as const, content: 'Respond concisely and state next step. If status unknown, say so and ask a targeted question.' },
  ];

  if (!client || !apiKey) {
    return { plan: { intent: 'support', missing_info_questions: [], recommended_next_tool_calls: [], user_visible_message: refusalPrompt.trim() }, raw: null };
  }

  const completion = await client.chat.completions.create({
    model: DEFAULT_MODEL,
    messages: input,
    temperature: 0.4,
  });

  return completion.choices[0]?.message?.content || 'I could not generate a response just now.';
}
