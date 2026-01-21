"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HotelCancelInput = exports.HotelBookInfoInput = exports.HotelBookInput = exports.HotelAvailInput = exports.HotelSearchInput = exports.SubmitJetInquiryEmptyLegInput = exports.SubmitJetInquiryCharterInput = exports.LookupCityAirportInput = exports.SearchJetsEmptyLegsInput = exports.SearchJetsCharterInput = exports.SaveUserPreferencesOutput = exports.SaveUserPreferencesInput = exports.CancelBookingOutput = exports.CancelBookingInput = exports.GetBookingStatusOutput = exports.GetBookingStatusInput = exports.RequestVendorCheckoutOutput = exports.RequestVendorCheckoutInput = exports.CreateBookingDraftOutput = exports.CreateBookingDraftInput = exports.GetOffersOutput = exports.Offer = exports.GetOffersInput = exports.GetListingDetailsOutput = exports.ListingDetails = exports.GetListingDetailsInput = exports.SearchListingsOutput = exports.ListingSummary = exports.SearchListingsInput = exports.AlfredPlanSchema = exports.ProposedActionSchema = exports.ToolCallSchema = exports.ToolNameEnum = exports.IntentEnum = void 0;
const zod_1 = require("zod");
exports.IntentEnum = zod_1.z.enum(['browse', 'plan', 'book', 'cancel', 'support', 'unknown']);
exports.ToolNameEnum = zod_1.z.enum([
    'search_listings',
    'get_listing_details',
    'get_offers',
    'create_booking_draft',
    'request_vendor_checkout',
    'get_booking_status',
    'cancel_booking',
    'save_user_preferences',
    'search_jets_charter',
    'search_jets_empty_legs',
    'lookup_city_airport',
    'submit_jet_inquiry_charter',
    'submit_jet_inquiry_empty_leg',
    'search_hotels',
    'hotel_avail',
    'hotel_book',
    'hotel_booking_info',
    'hotel_cancel',
]);
exports.ToolCallSchema = zod_1.z.object({
    tool: exports.ToolNameEnum,
    args: zod_1.z.record(zod_1.z.any()).default({}),
});
exports.ProposedActionSchema = zod_1.z.object({
    action: zod_1.z.string(),
    confirmationRequired: zod_1.z.boolean().default(false),
    summary: zod_1.z.string().optional(),
    bookingId: zod_1.z.string().optional(),
    toolCalls: zod_1.z.array(exports.ToolCallSchema).optional(),
});
exports.AlfredPlanSchema = zod_1.z.object({
    intent: exports.IntentEnum,
    missing_info_questions: zod_1.z.array(zod_1.z.string()).max(5).default([]),
    recommended_next_tool_calls: zod_1.z.array(exports.ToolCallSchema).max(3).default([]),
    user_visible_message: zod_1.z.string(),
    proposed_action: exports.ProposedActionSchema.optional(),
});
// Tool input/output schemas
exports.SearchListingsInput = zod_1.z.object({
    vertical: zod_1.z.enum(['jets', 'hotels', 'yachts', 'events', 'experiences']).optional(),
    query: zod_1.z.string().optional(),
    filters: zod_1.z.record(zod_1.z.any()).optional(),
    idempotencyKey: zod_1.z.string().optional(),
});
exports.ListingSummary = zod_1.z.object({
    id: zod_1.z.string(),
    title: zod_1.z.string(),
    location: zod_1.z.string().optional(),
    priceFrom: zod_1.z.number().optional(),
    currency: zod_1.z.string().default('USD'),
    vertical: zod_1.z.string().optional(),
    highlights: zod_1.z.array(zod_1.z.string()).optional(),
});
exports.SearchListingsOutput = zod_1.z.object({ results: zod_1.z.array(exports.ListingSummary) });
exports.GetListingDetailsInput = zod_1.z.object({ listingId: zod_1.z.string() });
exports.ListingDetails = exports.ListingSummary.extend({
    description: zod_1.z.string().optional(),
    images: zod_1.z.array(zod_1.z.string()).optional(),
    amenities: zod_1.z.array(zod_1.z.string()).optional(),
});
exports.GetListingDetailsOutput = zod_1.z.object({ listing: exports.ListingDetails });
exports.GetOffersInput = zod_1.z.object({
    listingId: zod_1.z.string(),
    constraints: zod_1.z.record(zod_1.z.any()).optional(),
});
exports.Offer = zod_1.z.object({
    id: zod_1.z.string(),
    price: zod_1.z.number(),
    currency: zod_1.z.string().default('USD'),
    cancellationPolicy: zod_1.z.string().optional(),
    notes: zod_1.z.string().optional(),
});
exports.GetOffersOutput = zod_1.z.object({ offers: zod_1.z.array(exports.Offer) });
exports.CreateBookingDraftInput = zod_1.z.object({
    listingId: zod_1.z.string(),
    offerId: zod_1.z.string(),
    travellers: zod_1.z.array(zod_1.z.object({
        name: zod_1.z.string(),
        email: zod_1.z.string().email().optional(),
    })).nonempty(),
    notes: zod_1.z.string().optional(),
    idempotencyKey: zod_1.z.string().optional(),
});
exports.CreateBookingDraftOutput = zod_1.z.object({ bookingId: zod_1.z.string(), status: zod_1.z.enum(['draft', 'pending', 'confirmed', 'cancelled']).default('draft') });
exports.RequestVendorCheckoutInput = zod_1.z.object({
    bookingId: zod_1.z.string(),
    idempotencyKey: zod_1.z.string().optional(),
});
exports.RequestVendorCheckoutOutput = zod_1.z.object({
    checkoutUrl: zod_1.z.string().url().optional(),
    status: zod_1.z.enum(['pending', 'ready', 'unavailable']).default('pending'),
});
exports.GetBookingStatusInput = zod_1.z.object({ bookingId: zod_1.z.string() });
exports.GetBookingStatusOutput = zod_1.z.object({
    status: zod_1.z.enum(['draft', 'pending', 'confirmed', 'cancelled', 'unknown']).default('unknown'),
    summary: zod_1.z.string().optional(),
});
exports.CancelBookingInput = zod_1.z.object({
    bookingId: zod_1.z.string(),
    reason: zod_1.z.string().optional(),
    idempotencyKey: zod_1.z.string().optional(),
});
exports.CancelBookingOutput = zod_1.z.object({ status: zod_1.z.enum(['cancelled', 'not_found', 'failed']).default('cancelled') });
exports.SaveUserPreferencesInput = zod_1.z.object({ prefs: zod_1.z.record(zod_1.z.any()) });
exports.SaveUserPreferencesOutput = zod_1.z.object({ ok: zod_1.z.boolean().default(true) });
// Jet tools inputs
exports.SearchJetsCharterInput = zod_1.z.object({
    currencyType: zod_1.z.string().default('USD'),
    queryType: zod_1.z.string().optional(),
    tripType: zod_1.z.string().optional(),
    trips: zod_1.z.array(zod_1.z.record(zod_1.z.any())).nonempty(),
    searchFilter: zod_1.z.record(zod_1.z.any()).optional(),
});
exports.SearchJetsEmptyLegsInput = zod_1.z.object({
    currencyType: zod_1.z.string().default('USD'),
    areaId: zod_1.z.string().optional(),
    depCity: zod_1.z.string().optional(),
    arrCity: zod_1.z.string().optional(),
    orderByMode: zod_1.z.string().optional(),
    pageNum: zod_1.z.string().optional(),
    pageSize: zod_1.z.string().optional(),
});
exports.LookupCityAirportInput = zod_1.z.object({ q: zod_1.z.string() });
exports.SubmitJetInquiryCharterInput = zod_1.z.object({
    firstName: zod_1.z.string(),
    lastName: zod_1.z.string(),
    email: zod_1.z.string(),
    phoneAreaCode: zod_1.z.string().optional(),
    phoneNumber: zod_1.z.string().optional(),
    tripType: zod_1.z.string(),
    charterType: zod_1.z.string().optional(),
    message: zod_1.z.string().optional(),
    trips: zod_1.z.array(zod_1.z.record(zod_1.z.any())).nonempty(),
    aircraftList: zod_1.z.array(zod_1.z.any()).optional(),
});
exports.SubmitJetInquiryEmptyLegInput = zod_1.z.object({
    emptyLegId: zod_1.z.string(),
    firstName: zod_1.z.string(),
    lastName: zod_1.z.string(),
    email: zod_1.z.string(),
    phoneAreaCode: zod_1.z.string().optional(),
    phoneNumber: zod_1.z.string().optional(),
    depTime: zod_1.z.string().optional(),
    message: zod_1.z.string().optional(),
});
// Hotel tools
exports.HotelSearchInput = zod_1.z.object({
    hotels: zod_1.z.array(zod_1.z.union([zod_1.z.string(), zod_1.z.number()])).optional(),
    checkin: zod_1.z.string().optional(),
    checkout: zod_1.z.string().optional(),
    rooms: zod_1.z.array(zod_1.z.record(zod_1.z.any())).optional(),
    nationality: zod_1.z.string().optional(),
    timout: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).optional(),
    timeout: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).optional(),
});
exports.HotelAvailInput = exports.HotelSearchInput;
exports.HotelBookInput = zod_1.z.object({
    client_reference: zod_1.z.string().optional(),
    passengers: zod_1.z.array(zod_1.z.record(zod_1.z.any())).optional(),
    rooms: zod_1.z.array(zod_1.z.union([zod_1.z.string(), zod_1.z.number()])).optional(),
    contact: zod_1.z.record(zod_1.z.any()).optional(),
});
exports.HotelBookInfoInput = zod_1.z.object({
    booking_reference: zod_1.z.string(),
    reference: zod_1.z.string().optional(),
});
exports.HotelCancelInput = zod_1.z.object({
    client_reference: zod_1.z.string().optional(),
    booking_reference: zod_1.z.string(),
    reference: zod_1.z.string().optional(),
});
//# sourceMappingURL=types.js.map