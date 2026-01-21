"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.TOOL_HANDLERS = void 0;
exports.executeTool = executeTool;
exports.sanitizeToolResult = sanitizeToolResult;
/**
 * Alfred tool router (clean, no demo data)
 */
const admin = __importStar(require("firebase-admin"));
const functions = __importStar(require("firebase-functions"));
const crypto_1 = require("crypto");
const types_1 = require("./types");
const policy_1 = require("./policy");
const jetbayApi_1 = require("../vendors/jetbay/jetbayApi");
const jetbayHttp_1 = require("../vendors/jetbay/jetbayHttp");
const wanderbedsApi_1 = require("../vendors/wanderbeds/wanderbedsApi");
const db = admin.firestore();
const ok = (data) => ({ ok: true, data });
const err = (code, message, details) => ({ ok: false, error: { code, message, details } });
async function handleSearchListings(args) {
    const parsed = types_1.SearchListingsInput.safeParse(args);
    if (!parsed.success)
        return err('INVALID_ARGS', parsed.error.message);
    return ok(types_1.SearchListingsOutput.parse({ results: [] }));
}
async function handleGetListingDetails(args) {
    const parsed = types_1.GetListingDetailsInput.safeParse(args);
    if (!parsed.success)
        return err('INVALID_ARGS', parsed.error.message);
    return ok(types_1.GetListingDetailsOutput.parse({
        listing: { id: parsed.data.listingId, title: 'Listing', location: '', priceFrom: 0, currency: 'USD', vertical: '', highlights: [] },
    }));
}
async function handleGetOffers(args) {
    const parsed = types_1.GetOffersInput.safeParse(args);
    if (!parsed.success)
        return err('INVALID_ARGS', parsed.error.message);
    return ok(types_1.GetOffersOutput.parse({ offers: [] }));
}
async function handleCreateBookingDraft(args, ctx) {
    const parsed = types_1.CreateBookingDraftInput.safeParse(args);
    if (!parsed.success)
        return err('INVALID_ARGS', parsed.error.message);
    const ref = db.collection('alfredBookings').doc();
    await ref.set({
        userId: ctx.userId || null,
        listingId: parsed.data.listingId,
        offerId: parsed.data.offerId,
        travellers: parsed.data.travellers.map((t) => (Object.assign(Object.assign({}, t), { email: t.email ? '[stored]' : undefined }))),
        notes: parsed.data.notes,
        status: 'draft',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return ok(types_1.CreateBookingDraftOutput.parse({ bookingId: ref.id, status: 'draft' }));
}
async function handleRequestVendorCheckout(args) {
    const parsed = types_1.RequestVendorCheckoutInput.safeParse(args);
    if (!parsed.success)
        return err('INVALID_ARGS', parsed.error.message);
    return ok(types_1.RequestVendorCheckoutOutput.parse({ checkoutUrl: `https://vaultfy.checkout/${parsed.data.bookingId}`, status: 'ready' }));
}
async function handleGetBookingStatus(args) {
    const parsed = types_1.GetBookingStatusInput.safeParse(args);
    if (!parsed.success)
        return err('INVALID_ARGS', parsed.error.message);
    const ref = db.collection('alfredBookings').doc(parsed.data.bookingId);
    const snap = await ref.get();
    if (!snap.exists)
        return ok(types_1.GetBookingStatusOutput.parse({ status: 'unknown', summary: 'Booking not found' }));
    const data = snap.data();
    return ok(types_1.GetBookingStatusOutput.parse({ status: (data === null || data === void 0 ? void 0 : data.status) || 'pending', summary: (data === null || data === void 0 ? void 0 : data.notes) || '' }));
}
async function handleCancelBooking(args) {
    const parsed = types_1.CancelBookingInput.safeParse(args);
    if (!parsed.success)
        return err('INVALID_ARGS', parsed.error.message);
    const ref = db.collection('alfredBookings').doc(parsed.data.bookingId);
    const snap = await ref.get();
    if (!snap.exists)
        return ok(types_1.CancelBookingOutput.parse({ status: 'not_found' }));
    await ref.set({ status: 'cancelled', cancelReason: parsed.data.reason || 'user_request' }, { merge: true });
    return ok(types_1.CancelBookingOutput.parse({ status: 'cancelled' }));
}
async function handleSavePrefs(args, ctx) {
    const parsed = types_1.SaveUserPreferencesInput.safeParse(args);
    if (!parsed.success)
        return err('INVALID_ARGS', parsed.error.message);
    if (ctx.sessionId) {
        await db.collection('alfredSessions').doc(ctx.sessionId).set({ userPreferences: parsed.data.prefs }, { merge: true });
    }
    return ok(types_1.SaveUserPreferencesOutput.parse({ ok: true }));
}
async function handleJetsCharter(args, ctx) {
    const parsed = types_1.SearchJetsCharterInput.safeParse(args);
    if (!parsed.success)
        return err('INVALID_ARGS', parsed.error.message);
    try {
        const res = await (0, jetbayApi_1.searchCharter)(parsed.data, ctx.correlationId || (0, crypto_1.randomUUID)(), ctx.userId);
        return ok(res);
    }
    catch (e) {
        if (e instanceof jetbayHttp_1.JetbayAuthError)
            return err('VENDOR_AUTH_ERROR', 'Jetbay authentication failed');
        return err('VENDOR_ERROR', 'Jetbay request failed');
    }
}
async function handleJetsEmpty(args, ctx) {
    const parsed = types_1.SearchJetsEmptyLegsInput.safeParse(args);
    if (!parsed.success)
        return err('INVALID_ARGS', parsed.error.message);
    try {
        const res = await (0, jetbayApi_1.emptyLegQueryPage)(parsed.data, ctx.correlationId || (0, crypto_1.randomUUID)(), ctx.userId);
        return ok(res);
    }
    catch (e) {
        if (e instanceof jetbayHttp_1.JetbayAuthError)
            return err('VENDOR_AUTH_ERROR', 'Jetbay authentication failed');
        return err('VENDOR_ERROR', 'Jetbay request failed');
    }
}
async function handleLookupCity(args) {
    const parsed = types_1.LookupCityAirportInput.safeParse(args);
    if (!parsed.success)
        return err('INVALID_ARGS', parsed.error.message);
    try {
        const res = await (0, jetbayApi_1.cityQuery)(parsed.data.q);
        return ok({ results: res });
    }
    catch (_e) {
        return err('VENDOR_ERROR', 'Jetbay request failed');
    }
}
async function handleInquiryCharter(args, ctx) {
    const parsed = types_1.SubmitJetInquiryCharterInput.safeParse(args);
    if (!parsed.success)
        return err('INVALID_ARGS', parsed.error.message);
    try {
        const res = await (0, jetbayApi_1.submitLead)(parsed.data, ctx.correlationId || (0, crypto_1.randomUUID)(), ctx.userId);
        return ok(Object.assign(Object.assign({}, res), { notice: 'Inquiry submitted to Jetbay' }));
    }
    catch (e) {
        if (e instanceof jetbayHttp_1.JetbayAuthError)
            return err('VENDOR_AUTH_ERROR', 'Jetbay authentication failed');
        return err('VENDOR_ERROR', 'Jetbay request failed');
    }
}
async function handleInquiryEmpty(args, ctx) {
    const parsed = types_1.SubmitJetInquiryEmptyLegInput.safeParse(args);
    if (!parsed.success)
        return err('INVALID_ARGS', parsed.error.message);
    try {
        const res = await (0, jetbayApi_1.submitEmptyLegLead)(parsed.data, ctx.correlationId || (0, crypto_1.randomUUID)(), ctx.userId);
        return ok(Object.assign(Object.assign({}, res), { notice: 'Inquiry submitted to Jetbay' }));
    }
    catch (e) {
        if (e instanceof jetbayHttp_1.JetbayAuthError)
            return err('VENDOR_AUTH_ERROR', 'Jetbay authentication failed');
        return err('VENDOR_ERROR', 'Jetbay request failed');
    }
}
async function handleHotelSearch(args) {
    const parsed = types_1.HotelSearchInput.safeParse(args);
    if (!parsed.success)
        return err('INVALID_ARGS', parsed.error.message);
    const res = await (0, wanderbedsApi_1.searchHotels)(parsed.data);
    return ok(res);
}
async function handleHotelAvail(args) {
    const parsed = types_1.HotelAvailInput.safeParse(args);
    if (!parsed.success)
        return err('INVALID_ARGS', parsed.error.message);
    const res = await (0, wanderbedsApi_1.availHotels)(parsed.data);
    return ok(res);
}
async function handleHotelBook(args, ctx) {
    if (!ctx.userId)
        return err('AUTH_REQUIRED', 'Sign in to book');
    const parsed = types_1.HotelBookInput.safeParse(args);
    if (!parsed.success)
        return err('INVALID_ARGS', parsed.error.message);
    const res = await (0, wanderbedsApi_1.book)(parsed.data);
    return ok(res);
}
async function handleHotelBookInfo(args, ctx) {
    if (!ctx.userId)
        return err('AUTH_REQUIRED', 'Sign in to view booking');
    const parsed = types_1.HotelBookInfoInput.safeParse(args);
    if (!parsed.success)
        return err('INVALID_ARGS', parsed.error.message);
    const res = await (0, wanderbedsApi_1.bookInfo)(parsed.data);
    return ok(res);
}
async function handleHotelCancel(args, ctx) {
    if (!ctx.userId)
        return err('AUTH_REQUIRED', 'Sign in to cancel booking');
    const parsed = types_1.HotelCancelInput.safeParse(args);
    if (!parsed.success)
        return err('INVALID_ARGS', parsed.error.message);
    const res = await (0, wanderbedsApi_1.cancel)(parsed.data);
    return ok(res);
}
const TOOL_HANDLERS = {
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
exports.TOOL_HANDLERS = TOOL_HANDLERS;
async function executeTool(call, ctx) {
    const handler = TOOL_HANDLERS[call.tool];
    if (!handler || !(0, policy_1.allowTool)(call.tool)) {
        throw new functions.https.HttpsError('failed-precondition', `Tool ${call.tool} not allowed`);
    }
    return handler(call.args || {}, ctx);
}
function sanitizeToolResult(result) {
    try {
        return JSON.parse(JSON.stringify(result, (_k, v) => (typeof v === 'string' ? (0, policy_1.redactPII)(v) : v)));
    }
    catch (_e) {
        return {};
    }
}
//# sourceMappingURL=toolRouter.js.map