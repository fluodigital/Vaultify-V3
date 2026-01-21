"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePlan = generatePlan;
exports.synthesizeFinalMessage = synthesizeFinalMessage;
const openai_1 = __importDefault(require("openai"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const types_1 = require("./types");
const policy_1 = require("./policy");
const systemPrompt = fs_1.default.readFileSync(path_1.default.join(__dirname, 'prompts', 'system.md'), 'utf8');
const developerPrompt = fs_1.default.readFileSync(path_1.default.join(__dirname, 'prompts', 'developer.md'), 'utf8');
const refusalPrompt = fs_1.default.readFileSync(path_1.default.join(__dirname, 'prompts', 'refusal.md'), 'utf8');
const apiKey = process.env.OPENAI_API_KEY;
const client = apiKey ? new openai_1.default({ apiKey }) : null;
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
async function generatePlan(request) {
    var _a, _b;
    const { userMessage, memorySummary, intentHint } = request;
    const injection = (0, policy_1.detectPromptInjection)(userMessage);
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
        { role: 'system', content: systemPrompt },
        { role: 'system', content: developerPrompt },
        { role: 'user', content: intentHint ? `Intent hint: ${intentHint}` : '' },
        {
            role: 'user',
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
    const raw = (_b = (_a = completion.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content;
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    const plan = types_1.AlfredPlanSchema.parse(parsed);
    return { plan, raw };
}
async function synthesizeFinalMessage(params) {
    var _a, _b;
    const { userMessage, plan, toolCalls = [], toolResults = [] } = params;
    const input = [
        { role: 'system', content: systemPrompt },
        { role: 'system', content: developerPrompt },
        {
            role: 'user',
            content: JSON.stringify({ userMessage, plan, toolCalls, toolResults }),
        },
        { role: 'system', content: 'Respond concisely and state next step. If status unknown, say so and ask a targeted question.' },
    ];
    if (!client || !apiKey) {
        return { plan: { intent: 'support', missing_info_questions: [], recommended_next_tool_calls: [], user_visible_message: refusalPrompt.trim() }, raw: null };
    }
    const completion = await client.chat.completions.create({
        model: DEFAULT_MODEL,
        messages: input,
        temperature: 0.4,
    });
    return ((_b = (_a = completion.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) || 'I could not generate a response just now.';
}
//# sourceMappingURL=openaiClient.js.map