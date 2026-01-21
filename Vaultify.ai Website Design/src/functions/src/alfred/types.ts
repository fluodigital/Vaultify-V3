import { z } from 'zod';

export const IntentEnum = z.enum(['browse', 'plan', 'book', 'cancel', 'support', 'unknown']);

export const ToolNameEnum = z.enum([
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

export const ToolCallSchema = z.object({
  tool: ToolNameEnum,
  args: z.record(z.any()).default({}),
});

export const ProposedActionSchema = z.object({
  action: z.string(),
  confirmationRequired: z.boolean().default(false),
  summary: z.string().optional(),
  bookingId: z.string().optional(),
  toolCalls: z.array(ToolCallSchema).optional(),
});

export const AlfredPlanSchema = z.object({
  intent: IntentEnum,
  missing_info_questions: z.array(z.string()).max(5).default([]),
  recommended_next_tool_calls: z.array(ToolCallSchema).max(3).default([]),
  user_visible_message: z.string(),
  proposed_action: ProposedActionSchema.optional(),
});

// Tool input/output schemas
export const SearchListingsInput = z.object({
  vertical: z.enum(['jets', 'hotels', 'yachts', 'events', 'experiences']).optional(),
  query: z.string().optional(),
  filters: z.record(z.any()).optional(),
  idempotencyKey: z.string().optional(),
});
export const ListingSummary = z.object({
  id: z.string(),
  title: z.string(),
  location: z.string().optional(),
  priceFrom: z.number().optional(),
  currency: z.string().default('USD'),
  vertical: z.string().optional(),
  highlights: z.array(z.string()).optional(),
});
export const SearchListingsOutput = z.object({ results: z.array(ListingSummary) });

export const GetListingDetailsInput = z.object({ listingId: z.string() });
export const ListingDetails = ListingSummary.extend({
  description: z.string().optional(),
  images: z.array(z.string()).optional(),
  amenities: z.array(z.string()).optional(),
});
export const GetListingDetailsOutput = z.object({ listing: ListingDetails });

export const GetOffersInput = z.object({
  listingId: z.string(),
  constraints: z.record(z.any()).optional(),
});
export const Offer = z.object({
  id: z.string(),
  price: z.number(),
  currency: z.string().default('USD'),
  cancellationPolicy: z.string().optional(),
  notes: z.string().optional(),
});
export const GetOffersOutput = z.object({ offers: z.array(Offer) });

export const CreateBookingDraftInput = z.object({
  listingId: z.string(),
  offerId: z.string(),
  travellers: z.array(z.object({
    name: z.string(),
    email: z.string().email().optional(),
  })).nonempty(),
  notes: z.string().optional(),
  idempotencyKey: z.string().optional(),
});
export const CreateBookingDraftOutput = z.object({ bookingId: z.string(), status: z.enum(['draft', 'pending', 'confirmed', 'cancelled']).default('draft') });

export const RequestVendorCheckoutInput = z.object({
  bookingId: z.string(),
  idempotencyKey: z.string().optional(),
});
export const RequestVendorCheckoutOutput = z.object({
  checkoutUrl: z.string().url().optional(),
  status: z.enum(['pending', 'ready', 'unavailable']).default('pending'),
});

export const GetBookingStatusInput = z.object({ bookingId: z.string() });
export const GetBookingStatusOutput = z.object({
  status: z.enum(['draft', 'pending', 'confirmed', 'cancelled', 'unknown']).default('unknown'),
  summary: z.string().optional(),
});

export const CancelBookingInput = z.object({
  bookingId: z.string(),
  reason: z.string().optional(),
  idempotencyKey: z.string().optional(),
});
export const CancelBookingOutput = z.object({ status: z.enum(['cancelled', 'not_found', 'failed']).default('cancelled') });

export const SaveUserPreferencesInput = z.object({ prefs: z.record(z.any()) });
export const SaveUserPreferencesOutput = z.object({ ok: z.boolean().default(true) });

// Jet tools inputs
export const SearchJetsCharterInput = z.object({
  currencyType: z.string().default('USD'),
  queryType: z.string().optional(),
  tripType: z.string().optional(),
  trips: z.array(z.record(z.any())).nonempty(),
  searchFilter: z.record(z.any()).optional(),
});
export const SearchJetsEmptyLegsInput = z.object({
  currencyType: z.string().default('USD'),
  areaId: z.string().optional(),
  depCity: z.string().optional(),
  arrCity: z.string().optional(),
  orderByMode: z.string().optional(),
  pageNum: z.string().optional(),
  pageSize: z.string().optional(),
});
export const LookupCityAirportInput = z.object({ q: z.string() });
export const SubmitJetInquiryCharterInput = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
  phoneAreaCode: z.string().optional(),
  phoneNumber: z.string().optional(),
  tripType: z.string(),
  charterType: z.string().optional(),
  message: z.string().optional(),
  trips: z.array(z.record(z.any())).nonempty(),
  aircraftList: z.array(z.any()).optional(),
});
export const SubmitJetInquiryEmptyLegInput = z.object({
  emptyLegId: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
  phoneAreaCode: z.string().optional(),
  phoneNumber: z.string().optional(),
  depTime: z.string().optional(),
  message: z.string().optional(),
});

// Hotel tools
export const HotelSearchInput = z.object({
  hotels: z.array(z.union([z.string(), z.number()])).optional(),
  checkin: z.string().optional(),
  checkout: z.string().optional(),
  rooms: z.array(z.record(z.any())).optional(),
  nationality: z.string().optional(),
  timout: z.union([z.string(), z.number()]).optional(),
  timeout: z.union([z.string(), z.number()]).optional(),
});
export const HotelAvailInput = HotelSearchInput;
export const HotelBookInput = z.object({
  client_reference: z.string().optional(),
  passengers: z.array(z.record(z.any())).optional(),
  rooms: z.array(z.union([z.string(), z.number()])).optional(),
  contact: z.record(z.any()).optional(),
});
export const HotelBookInfoInput = z.object({
  booking_reference: z.string(),
  reference: z.string().optional(),
});
export const HotelCancelInput = z.object({
  client_reference: z.string().optional(),
  booking_reference: z.string(),
  reference: z.string().optional(),
});

export type AlfredPlan = z.infer<typeof AlfredPlanSchema>;
export type ToolCall = z.infer<typeof ToolCallSchema>;
export type ProposedAction = z.infer<typeof ProposedActionSchema>;
export type ToolName = z.infer<typeof ToolNameEnum>;
export type SessionMemory = {
  userPreferences?: Record<string, any>;
  currentTripContext?: Record<string, any>;
  pendingAction?: ProposedAction | null;
  lastShortlist?: any;
};
