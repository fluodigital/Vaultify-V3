/**
 * Wanderbeds Response Mappers
 * 
 * Maps vendor API responses to internal models
 */

import {
  WanderbedsSearchResponse,
  WanderbedsAvailResponse,
  WanderbedsBookResponse,
  WanderbedsCancelResponse,
} from './types';

/**
 * Internal Hotel Model
 */
export interface InternalHotel {
  id: string;
  name: string;
  stars: number;
  country: string;
  city: string;
  address?: string;
  lat?: number;
  lon?: number;
  lowestPriceTotal?: number;
  currency?: string;
  refundableAny?: boolean;
  roomOffersCount?: number;
}

/**
 * Internal Room Model
 */
export interface InternalRoom {
  offerId: string;
  name: string;
  refundable: boolean;
  package: boolean;
  roomType?: { code: string; name: string };
  meal?: { code: string; name: string };
  view?: { code: string; name: string };
  price: {
    base: number;
    tax: number;
    margin: number;
    total: number;
    currency: string;
  };
  cancelPolicy?: {
    from: string;
    amount: number;
    currency: string;
  };
  additionalFees?: {
    breakdown?: Array<{ name: string; amount: number; currency: string }>;
    total?: number;
    currency?: string;
  };
  remarks?: string[];
  roomIndex?: number;
  group?: number;
}

/**
 * Internal Search Result
 */
export interface InternalSearchResult {
  token: string;
  count: number;
  hotels: InternalHotel[];
}

/**
 * Internal Availability Result
 */
export interface InternalAvailabilityResult {
  token: string;
  products: Array<{
    hotelId: string;
    name: string;
    starRating?: number;
    country?: string;
    cityName?: string;
    address?: string;
    location?: { lat?: number; lng?: number };
    rooms: InternalRoom[];
    remarks?: string[];
  }>;
  summary?: {
    currency: string;
    nettotal: number;
    tax: number;
    margin: number;
    total: number;
    paymentplan?: Record<string, number>;
    taxinfo?: any[];
  };
  required?: {
    nationality?: boolean;
    chdbirthdate?: boolean;
  };
}

/**
 * Map search response to internal model
 */
export function mapSearchResponse(vendorResp: WanderbedsSearchResponse): InternalSearchResult {
  const hotels: InternalHotel[] = (vendorResp.hotels || []).map((h) => {
    const rooms = h.rooms || [];
    const prices = rooms.map((r) => r.price?.total || 0).filter((p) => p > 0);
    const lowestPrice = prices.length > 0 ? Math.min(...prices) : undefined;
    const currency = rooms[0]?.price?.currency;

    return {
      id: String(h.hotelid),
      name: h.hotelname || '',
      stars: h.starrating || 0,
      country: h.country || '',
      city: h.cityname || '',
      address: h.address,
      lat: h.location?.lat ? Number(h.location.lat) : undefined,
      lon: h.location?.lon ? Number(h.location.lon) : undefined,
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
function mapRoom(vendorRoom: any): InternalRoom {
  return {
    offerId: vendorRoom.offerid || '',
    name: vendorRoom.name || '',
    refundable: vendorRoom.refundable === true,
    package: vendorRoom.package === true,
    roomType: vendorRoom.roomtype,
    meal: vendorRoom.meal,
    view: vendorRoom.view,
    price: {
      base: vendorRoom.price?.baseprice || 0,
      tax: vendorRoom.price?.tax || 0,
      margin: vendorRoom.price?.margin || 0,
      total: vendorRoom.price?.total || 0,
      currency: vendorRoom.price?.currency || '',
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
export function mapAvailabilityResponse(vendorResp: WanderbedsAvailResponse): InternalAvailabilityResult {
  const products = (vendorResp.data?.products || []).map((p) => ({
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

  const required = vendorResp.data?.required
    ? {
        nationality: (Number(vendorResp.data.required.nationality) || 0) > 0,
        chdbirthdate: (Number(vendorResp.data.required.chdbirthdate) || 0) > 0,
      }
    : undefined;

  return {
    token: vendorResp.token || '',
    products,
    summary: vendorResp.data?.summary,
    required,
  };
}

/**
 * Map book response to internal model
 */
export function mapBookResponse(vendorResp: WanderbedsBookResponse) {
  // Extract booking references and status
  const products = (vendorResp.data?.products || []).map((p) => ({
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
    rooms: (p.rooms || []).map((r) => ({
      ...mapRoom(r),
      booking: r.booking
        ? {
            status: r.booking.status,
            bookingReference: r.booking.booking_reference,
            reference: r.booking.reference,
            clientReference: r.booking.client_reference,
            confirmationNumber: r.booking.confirmation_number,
          }
        : undefined,
    })),
    remarks: p.remarks,
  }));

  return {
    token: vendorResp.token || '',
    contact: vendorResp.data?.contact,
    passengers: vendorResp.data?.passengers || [],
    products,
  };
}

/**
 * Map cancel response to internal model
 */
export function mapCancelResponse(vendorResp: WanderbedsCancelResponse) {
  // Similar to book response but with success flag
  const products = (vendorResp.data?.products || []).map((p) => ({
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
    rooms: (p.rooms || []).map((r) => ({
      ...mapRoom(r),
      booking: r.booking
        ? {
            status: r.booking.status,
            bookingReference: r.booking.booking_reference,
            reference: r.booking.reference,
            clientReference: r.booking.client_reference,
            confirmationNumber: r.booking.confirmation_number,
          }
        : undefined,
    })),
    remarks: p.remarks,
  }));

  return {
    success: vendorResp.data?.success === true,
    token: vendorResp.token || '',
    contact: vendorResp.data?.contact,
    passengers: vendorResp.data?.passengers || [],
    products,
  };
}
