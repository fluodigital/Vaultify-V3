import { ToolName } from './types';

const allowedTools: Record<ToolName, true> = {
  search_listings: true,
  get_listing_details: true,
  get_offers: true,
  create_booking_draft: true,
  request_vendor_checkout: true,
  get_booking_status: true,
  cancel_booking: true,
  save_user_preferences: true,
  search_jets_charter: true,
  search_jets_empty_legs: true,
  lookup_city_airport: true,
  submit_jet_inquiry_charter: true,
  submit_jet_inquiry_empty_leg: true,
  search_hotels: true,
  hotel_avail: true,
  hotel_book: true,
  hotel_booking_info: true,
  hotel_cancel: true,
};

export function classifyIntent(text: string) {
  const lower = text.toLowerCase();
  if (/book|reserve|lock in|confirm/.test(lower)) return { category: 'book' as const };
  if (/cancel/.test(lower)) return { category: 'cancel' as const };
  if (/status|is it booked|confirmed/.test(lower)) return { category: 'support' as const };
  if (/plan|itinerary|recommend|options/.test(lower)) return { category: 'plan' as const };
  if (/search|find|look for/.test(lower)) return { category: 'browse' as const };
  return { category: 'unknown' as const };
}

export function requiresConfirmation(action: string) {
  return /(book|confirm|pay|charge|cancel|share_pii|share|purchase)/i.test(action);
}

export function redactPII(text: string) {
  return text
    .replace(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, '[redacted-email]')
    .replace(/(\+?\d[\d\s().-]{7,}\d)/g, '[redacted-phone]')
    .replace(/([A-Z0-9]{6,9})/g, '[redacted-id]');
}

export function allowTool(toolName: string): toolName is ToolName {
  return (allowedTools as Record<string, true>)[toolName] === true;
}

export type InjectionFlags = {
  flagged: boolean;
  reasons: string[];
  severity: 'low' | 'high';
};

export function detectPromptInjection(text: string): InjectionFlags {
  const reasons: string[] = [];
  const lower = text.toLowerCase();
  if (lower.includes('ignore previous')) reasons.push('ignore_previous');
  if (lower.includes('reveal') && lower.includes('system')) reasons.push('reveal_system');
  if (lower.includes('api key') || lower.includes('secret')) reasons.push('seek_secret');
  if (lower.includes('call') && lower.includes('vendor')) reasons.push('call_vendor');
  if (lower.includes('override') && lower.includes('instruction')) reasons.push('override_instructions');
  const flagged = reasons.length > 0;
  const severity: 'low' | 'high' = reasons.includes('seek_secret') || reasons.includes('call_vendor') ? 'high' : 'low';
  return { flagged, reasons, severity };
}
