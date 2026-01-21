"use strict";
/**
 * Wanderbeds Response Mappers
 *
 * Maps vendor API responses to internal models
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapSearchResponse = mapSearchResponse;
exports.mapAvailabilityResponse = mapAvailabilityResponse;
exports.mapBookResponse = mapBookResponse;
exports.mapCancelResponse = mapCancelResponse;
/**
 * Map search response to internal model
 */
function mapSearchResponse(vendorResp) {
    const hotels = (vendorResp.hotels || []).map((h) => {
        var _a, _b, _c, _d;
        const rooms = h.rooms || [];
        const prices = rooms.map((r) => { var _a; return ((_a = r.price) === null || _a === void 0 ? void 0 : _a.total) || 0; }).filter((p) => p > 0);
        const lowestPrice = prices.length > 0 ? Math.min(...prices) : undefined;
        const currency = (_b = (_a = rooms[0]) === null || _a === void 0 ? void 0 : _a.price) === null || _b === void 0 ? void 0 : _b.currency;
        return {
            id: String(h.hotelid),
            name: h.hotelname || '',
            stars: h.starrating || 0,
            country: h.country || '',
            city: h.cityname || '',
            address: h.address,
            lat: ((_c = h.location) === null || _c === void 0 ? void 0 : _c.lat) ? Number(h.location.lat) : undefined,
            lon: ((_d = h.location) === null || _d === void 0 ? void 0 : _d.lon) ? Number(h.location.lon) : undefined,
            lowestPriceTotal: lowestPrice,
            currency,
            refundableAny: rooms.some((r) => r.refundable === true),
            roomOffersCount: rooms.length,
        };
    });
    return {
        token: vendorResp.token || '',
        count: vendorResp.count || 0,
        hotels,
    };
}
/**
 * Map room from vendor to internal
 */
function mapRoom(vendorRoom) {
    var _a, _b, _c, _d, _e;
    return {
        offerId: vendorRoom.offerid || '',
        name: vendorRoom.name || '',
        refundable: vendorRoom.refundable === true,
        package: vendorRoom.package === true,
        roomType: vendorRoom.roomtype,
        meal: vendorRoom.meal,
        view: vendorRoom.view,
        price: {
            base: ((_a = vendorRoom.price) === null || _a === void 0 ? void 0 : _a.baseprice) || 0,
            tax: ((_b = vendorRoom.price) === null || _b === void 0 ? void 0 : _b.tax) || 0,
            margin: ((_c = vendorRoom.price) === null || _c === void 0 ? void 0 : _c.margin) || 0,
            total: ((_d = vendorRoom.price) === null || _d === void 0 ? void 0 : _d.total) || 0,
            currency: ((_e = vendorRoom.price) === null || _e === void 0 ? void 0 : _e.currency) || '',
        },
        cancelPolicy: vendorRoom.cancelpolicy
            ? {
                from: vendorRoom.cancelpolicy.from || '',
                amount: vendorRoom.cancelpolicy.amount || 0,
                currency: vendorRoom.cancelpolicy.currency || '',
            }
            : undefined,
        additionalFees: vendorRoom.additionalfees
            ? {
                breakdown: vendorRoom.additionalfees.breakdown,
                total: vendorRoom.additionalfees.total,
                currency: vendorRoom.additionalfees.currency,
            }
            : undefined,
        remarks: vendorRoom.remarks,
        roomIndex: vendorRoom.roomindex,
        group: vendorRoom.group,
    };
}
/**
 * Map availability response to internal model
 */
function mapAvailabilityResponse(vendorResp) {
    var _a, _b, _c;
    const products = (((_a = vendorResp.data) === null || _a === void 0 ? void 0 : _a.products) || []).map((p) => ({
        hotelId: String(p.hotelid),
        name: p.hotelname || '',
        starRating: p.starrating,
        country: p.country,
        cityName: p.cityname,
        address: p.address,
        location: p.location
            ? {
                lat: p.location.lat ? Number(p.location.lat) : undefined,
                lng: p.location.lon ? Number(p.location.lon) : undefined,
            }
            : undefined,
        rooms: (p.rooms || []).map(mapRoom),
        remarks: p.remarks,
    }));
    const required = ((_b = vendorResp.data) === null || _b === void 0 ? void 0 : _b.required)
        ? {
            nationality: (Number(vendorResp.data.required.nationality) || 0) > 0,
            chdbirthdate: (Number(vendorResp.data.required.chdbirthdate) || 0) > 0,
        }
        : undefined;
    return {
        token: vendorResp.token || '',
        products,
        summary: (_c = vendorResp.data) === null || _c === void 0 ? void 0 : _c.summary,
        required,
    };
}
/**
 * Map book response to internal model
 */
function mapBookResponse(vendorResp) {
    var _a, _b, _c;
    // Extract booking references and status
    const products = (((_a = vendorResp.data) === null || _a === void 0 ? void 0 : _a.products) || []).map((p) => ({
        hotelId: String(p.hotelid),
        name: p.hotelname || '',
        starRating: p.starrating,
        country: p.country,
        cityName: p.cityname,
        address: p.address,
        location: p.location
            ? {
                lat: p.location.lat ? Number(p.location.lat) : undefined,
                lng: p.location.lon ? Number(p.location.lon) : undefined,
            }
            : undefined,
        rooms: (p.rooms || []).map((r) => (Object.assign(Object.assign({}, mapRoom(r)), { booking: r.booking
                ? {
                    status: r.booking.status,
                    bookingReference: r.booking.booking_reference,
                    reference: r.booking.reference,
                    clientReference: r.booking.client_reference,
                    confirmationNumber: r.booking.confirmation_number,
                }
                : undefined }))),
        remarks: p.remarks,
    }));
    return {
        token: vendorResp.token || '',
        contact: (_b = vendorResp.data) === null || _b === void 0 ? void 0 : _b.contact,
        passengers: ((_c = vendorResp.data) === null || _c === void 0 ? void 0 : _c.passengers) || [],
        products,
    };
}
/**
 * Map cancel response to internal model
 */
function mapCancelResponse(vendorResp) {
    var _a, _b, _c, _d;
    // Similar to book response but with success flag
    const products = (((_a = vendorResp.data) === null || _a === void 0 ? void 0 : _a.products) || []).map((p) => ({
        hotelId: String(p.hotelid),
        name: p.hotelname || '',
        starRating: p.starrating,
        country: p.country,
        cityName: p.cityname,
        address: p.address,
        location: p.location
            ? {
                lat: p.location.lat ? Number(p.location.lat) : undefined,
                lng: p.location.lon ? Number(p.location.lon) : undefined,
            }
            : undefined,
        rooms: (p.rooms || []).map((r) => (Object.assign(Object.assign({}, mapRoom(r)), { booking: r.booking
                ? {
                    status: r.booking.status,
                    bookingReference: r.booking.booking_reference,
                    reference: r.booking.reference,
                    clientReference: r.booking.client_reference,
                    confirmationNumber: r.booking.confirmation_number,
                }
                : undefined }))),
        remarks: p.remarks,
    }));
    return {
        success: ((_b = vendorResp.data) === null || _b === void 0 ? void 0 : _b.success) === true,
        token: vendorResp.token || '',
        contact: (_c = vendorResp.data) === null || _c === void 0 ? void 0 : _c.contact,
        passengers: ((_d = vendorResp.data) === null || _d === void 0 ? void 0 : _d.passengers) || [],
        products,
    };
}
//# sourceMappingURL=mappers.js.map