"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.classifyIntent = classifyIntent;
exports.requiresConfirmation = requiresConfirmation;
exports.redactPII = redactPII;
exports.allowTool = allowTool;
exports.detectPromptInjection = detectPromptInjection;
const allowedTools = {
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
function classifyIntent(text) {
    const lower = text.toLowerCase();
    if (/book|reserve|lock in|confirm/.test(lower))
        return { category: 'book' };
    if (/cancel/.test(lower))
        return { category: 'cancel' };
    if (/status|is it booked|confirmed/.test(lower))
        return { category: 'support' };
    if (/plan|itinerary|recommend|options/.test(lower))
        return { category: 'plan' };
    if (/search|find|look for/.test(lower))
        return { category: 'browse' };
    return { category: 'unknown' };
}
function requiresConfirmation(action) {
    return /(book|confirm|pay|charge|cancel|share_pii|share|purchase)/i.test(action);
}
function redactPII(text) {
    return text
        .replace(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, '[redacted-email]')
        .replace(/(\+?\d[\d\s().-]{7,}\d)/g, '[redacted-phone]')
        .replace(/([A-Z0-9]{6,9})/g, '[redacted-id]');
}
function allowTool(toolName) {
    return allowedTools[toolName] === true;
}
function detectPromptInjection(text) {
    const reasons = [];
    const lower = text.toLowerCase();
    if (lower.includes('ignore previous'))
        reasons.push('ignore_previous');
    if (lower.includes('reveal') && lower.includes('system'))
        reasons.push('reveal_system');
    if (lower.includes('api key') || lower.includes('secret'))
        reasons.push('seek_secret');
    if (lower.includes('call') && lower.includes('vendor'))
        reasons.push('call_vendor');
    if (lower.includes('override') && lower.includes('instruction'))
        reasons.push('override_instructions');
    const flagged = reasons.length > 0;
    const severity = reasons.includes('seek_secret') || reasons.includes('call_vendor') ? 'high' : 'low';
    return { flagged, reasons, severity };
}
//# sourceMappingURL=policy.js.map