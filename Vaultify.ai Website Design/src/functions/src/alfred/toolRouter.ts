/**
 * Alfred tool router (clean, no demo data)
 */
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { randomUUID } from 'crypto';
import {
  CancelBookingInput,
  CancelBookingOutput,
  CreateBookingDraftInput,
  CreateBookingDraftOutput,
  GetBookingStatusInput,
  GetBookingStatusOutput,
  GetListingDetailsInput,
  GetListingDetailsOutput,
  GetOffersInput,
  GetOffersOutput,
  LookupCityAirportInput,
  RequestVendorCheckoutInput,
  RequestVendorCheckoutOutput,
  SaveUserPreferencesInput,
  SaveUserPreferencesOutput,
  SearchListingsInput,
  SearchListingsOutput,
  SearchJetsCharterInput,
  SearchJetsEmptyLegsInput,
  SubmitJetInquiryCharterInput,
  SubmitJetInquiryEmptyLegInput,
  ToolName,
  HotelSearchInput,
  HotelAvailInput,
  HotelBookInput,
  HotelBookInfoInput,
  HotelCancelInput,
} from './types';
import { allowTool, redactPII } from './policy';
import { cityQuery, emptyLegQueryPage, searchCharter, submitEmptyLegLead, submitLead } from '../vendors/jetbay/jetbayApi';
import { JetbayAuthError } from '../vendors/jetbay/jetbayHttp';
import { availHotels, book, bookInfo, cancel, searchHotels } from '../vendors/wanderbeds/wanderbedsApi';

type ToolContext = { correlationId: string; userId?: string; sessionId?: string };

const db = admin.firestore();

const ok = (data: any) => ({ ok: true, data });
const err = (code: string, message: string, details?: any) => ({ ok: false, error: { code, message, details } });

async function handleSearchListings(args: any) {
  const parsed = SearchListingsInput.safeParse(args);
  if (!parsed.success) return err('INVALID_ARGS', parsed.error.message);
  return ok(SearchListingsOutput.parse({ results: [] }));
}

async function handleGetListingDetails(args: any) {
  const parsed = GetListingDetailsInput.safeParse(args);
  if (!parsed.success) return err('INVALID_ARGS', parsed.error.message);
  return ok(
    GetListingDetailsOutput.parse({
      listing: { id: parsed.data.listingId, title: 'Listing', location: '', priceFrom: 0, currency: 'USD', vertical: '', highlights: [] } as any,
    }),
  );
}

async function handleGetOffers(args: any) {
  const parsed = GetOffersInput.safeParse(args);
  if (!parsed.success) return err('INVALID_ARGS', parsed.error.message);
  return ok(GetOffersOutput.parse({ offers: [] }));
}

async function handleCreateBookingDraft(args: any, ctx: ToolContext) {
  const parsed = CreateBookingDraftInput.safeParse(args);
  if (!parsed.success) return err('INVALID_ARGS', parsed.error.message);
  const ref = db.collection('alfredBookings').doc();
  await ref.set({
    userId: ctx.userId || null,
    listingId: parsed.data.listingId,
    offerId: parsed.data.offerId,
    travellers: parsed.data.travellers.map((t) => ({ ...t, email: t.email ? '[stored]' : undefined })),
    notes: parsed.data.notes,
    status: 'draft',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  return ok(CreateBookingDraftOutput.parse({ bookingId: ref.id, status: 'draft' }));
}

async function handleRequestVendorCheckout(args: any) {
  const parsed = RequestVendorCheckoutInput.safeParse(args);
  if (!parsed.success) return err('INVALID_ARGS', parsed.error.message);
  return ok(RequestVendorCheckoutOutput.parse({ checkoutUrl: `https://vaultfy.checkout/${parsed.data.bookingId}`, status: 'ready' }));
}

async function handleGetBookingStatus(args: any) {
  const parsed = GetBookingStatusInput.safeParse(args);
  if (!parsed.success) return err('INVALID_ARGS', parsed.error.message);
  const ref = db.collection('alfredBookings').doc(parsed.data.bookingId);
  const snap = await ref.get();
  if (!snap.exists) return ok(GetBookingStatusOutput.parse({ status: 'unknown', summary: 'Booking not found' }));
  const data = snap.data();
  return ok(GetBookingStatusOutput.parse({ status: (data?.status as any) || 'pending', summary: data?.notes || '' }));
}

async function handleCancelBooking(args: any) {
  const parsed = CancelBookingInput.safeParse(args);
  if (!parsed.success) return err('INVALID_ARGS', parsed.error.message);
  const ref = db.collection('alfredBookings').doc(parsed.data.bookingId);
  const snap = await ref.get();
  if (!snap.exists) return ok(CancelBookingOutput.parse({ status: 'not_found' }));
  await ref.set({ status: 'cancelled', cancelReason: parsed.data.reason || 'user_request' }, { merge: true });
  return ok(CancelBookingOutput.parse({ status: 'cancelled' }));
}

async function handleSavePrefs(args: any, ctx: ToolContext) {
  const parsed = SaveUserPreferencesInput.safeParse(args);
  if (!parsed.success) return err('INVALID_ARGS', parsed.error.message);
  if (ctx.sessionId) {
    await db.collection('alfredSessions').doc(ctx.sessionId).set({ userPreferences: parsed.data.prefs }, { merge: true });
  }
  return ok(SaveUserPreferencesOutput.parse({ ok: true }));
}

async function handleJetsCharter(args: any, ctx: ToolContext) {
  const parsed = SearchJetsCharterInput.safeParse(args);
  if (!parsed.success) return err('INVALID_ARGS', parsed.error.message);
  try {
    const res = await searchCharter(parsed.data, ctx.correlationId || randomUUID(), ctx.userId);
    return ok(res);
  } catch (e: any) {
    if (e instanceof JetbayAuthError) return err('VENDOR_AUTH_ERROR', 'Jetbay authentication failed');
    return err('VENDOR_ERROR', 'Jetbay request failed');
  }
}

async function handleJetsEmpty(args: any, ctx: ToolContext) {
  const parsed = SearchJetsEmptyLegsInput.safeParse(args);
  if (!parsed.success) return err('INVALID_ARGS', parsed.error.message);
  try {
    const res = await emptyLegQueryPage(parsed.data, ctx.correlationId || randomUUID(), ctx.userId);
    return ok(res);
  } catch (e: any) {
    if (e instanceof JetbayAuthError) return err('VENDOR_AUTH_ERROR', 'Jetbay authentication failed');
    return err('VENDOR_ERROR', 'Jetbay request failed');
  }
}

async function handleLookupCity(args: any) {
  const parsed = LookupCityAirportInput.safeParse(args);
  if (!parsed.success) return err('INVALID_ARGS', parsed.error.message);
  try {
    const res = await cityQuery(parsed.data.q);
    return ok({ results: res });
  } catch (_e: any) {
    return err('VENDOR_ERROR', 'Jetbay request failed');
  }
}

async function handleInquiryCharter(args: any, ctx: ToolContext) {
  const parsed = SubmitJetInquiryCharterInput.safeParse(args);
  if (!parsed.success) return err('INVALID_ARGS', parsed.error.message);
  try {
    const res = await submitLead(parsed.data, ctx.correlationId || randomUUID(), ctx.userId);
    return ok({ ...res, notice: 'Inquiry submitted to Jetbay' });
  } catch (e: any) {
    if (e instanceof JetbayAuthError) return err('VENDOR_AUTH_ERROR', 'Jetbay authentication failed');
    return err('VENDOR_ERROR', 'Jetbay request failed');
  }
}

async function handleInquiryEmpty(args: any, ctx: ToolContext) {
  const parsed = SubmitJetInquiryEmptyLegInput.safeParse(args);
  if (!parsed.success) return err('INVALID_ARGS', parsed.error.message);
  try {
    const res = await submitEmptyLegLead(parsed.data, ctx.correlationId || randomUUID(), ctx.userId);
    return ok({ ...res, notice: 'Inquiry submitted to Jetbay' });
  } catch (e: any) {
    if (e instanceof JetbayAuthError) return err('VENDOR_AUTH_ERROR', 'Jetbay authentication failed');
    return err('VENDOR_ERROR', 'Jetbay request failed');
  }
}

async function handleHotelSearch(args: any) {
  const parsed = HotelSearchInput.safeParse(args);
  if (!parsed.success) return err('INVALID_ARGS', parsed.error.message);
  const res = await searchHotels(parsed.data);
  return ok(res);
}

async function handleHotelAvail(args: any) {
  const parsed = HotelAvailInput.safeParse(args);
  if (!parsed.success) return err('INVALID_ARGS', parsed.error.message);
  const res = await availHotels(parsed.data);
  return ok(res);
}

async function handleHotelBook(args: any, ctx: ToolContext) {
  if (!ctx.userId) return err('AUTH_REQUIRED', 'Sign in to book');
  const parsed = HotelBookInput.safeParse(args);
  if (!parsed.success) return err('INVALID_ARGS', parsed.error.message);
  const res = await book(parsed.data);
  return ok(res);
}

async function handleHotelBookInfo(args: any, ctx: ToolContext) {
  if (!ctx.userId) return err('AUTH_REQUIRED', 'Sign in to view booking');
  const parsed = HotelBookInfoInput.safeParse(args);
  if (!parsed.success) return err('INVALID_ARGS', parsed.error.message);
  const res = await bookInfo(parsed.data);
  return ok(res);
}

async function handleHotelCancel(args: any, ctx: ToolContext) {
  if (!ctx.userId) return err('AUTH_REQUIRED', 'Sign in to cancel booking');
  const parsed = HotelCancelInput.safeParse(args);
  if (!parsed.success) return err('INVALID_ARGS', parsed.error.message);
  const res = await cancel(parsed.data);
  return ok(res);
}

const TOOL_HANDLERS: Record<ToolName, (args: any, ctx: ToolContext) => Promise<any>> = {
  search_listings: handleSearchListings,
  get_listing_details: handleGetListingDetails,
  get_offers: handleGetOffers,
  create_booking_draft: handleCreateBookingDraft,
  request_vendor_checkout: handleRequestVendorCheckout,
  get_booking_status: handleGetBookingStatus,
  cancel_booking: handleCancelBooking,
  save_user_preferences: handleSavePrefs,
  search_jets_charter: handleJetsCharter,
  search_jets_empty_legs: handleJetsEmpty,
  lookup_city_airport: handleLookupCity,
  submit_jet_inquiry_charter: handleInquiryCharter,
  submit_jet_inquiry_empty_leg: handleInquiryEmpty,
  search_hotels: handleHotelSearch,
  hotel_avail: handleHotelAvail,
  hotel_book: handleHotelBook,
  hotel_booking_info: handleHotelBookInfo,
  hotel_cancel: handleHotelCancel,
};

export async function executeTool(call: { tool: ToolName; args: any }, ctx: ToolContext) {
  const handler = TOOL_HANDLERS[call.tool];
  if (!handler || !allowTool(call.tool)) {
    throw new functions.https.HttpsError('failed-precondition', `Tool ${call.tool} not allowed`);
  }
  return handler(call.args || {}, ctx);
}

export function sanitizeToolResult(result: any) {
  try {
    return JSON.parse(JSON.stringify(result, (_k, v) => (typeof v === 'string' ? redactPII(v) : v)));
  } catch (_e) {
    return {};
  }
}

export { TOOL_HANDLERS };
