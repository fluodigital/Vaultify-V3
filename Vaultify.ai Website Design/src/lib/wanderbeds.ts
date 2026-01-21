/**
 * Wanderbeds Frontend Client
 * 
 * Clean client for our /api/wanderbeds/* routes
 * Consumes internal models, never vendor shapes
 */

import { apiGet, apiPost, apiBaseUrl } from './api';

// ============================================================
// Response Types (Internal Contract)
// ============================================================

interface ApiResponse<T> {
  ok: boolean;
  data: T | null;
  meta: {
    source: 'wanderbeds';
    server?: string;
    time?: string;
    ms?: number;
    status?: number;
  };
  error: {
    code: string;
    message: string;
    upstreamStatus?: number;
    upstreamMs?: number;
  } | null;
}

export interface WanderbedsHotel {
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

export interface WanderbedsRoom {
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

export interface WanderbedsSearchRequest {
  hotels: number[];
  checkin: string; // YYYY-MM-DD
  checkout: string; // YYYY-MM-DD
  rooms: Array<{
    adt: number;
    chd?: number;
    age?: number[];
  }>;
  nationality: string; // ISO 2-letter code
  timout?: string; // Note: typo in vendor API
}

export interface WanderbedsSearchResponse {
  token: string;
  count: number;
  hotels: WanderbedsHotel[];
}

export interface WanderbedsAvailRequest {
  token: string;
  rooms: string[]; // offer IDs
}

export interface WanderbedsAvailabilityProduct {
  hotelId: string;
  name: string;
  starRating?: number;
  country?: string;
  cityName?: string;
  address?: string;
  location?: { lat?: number; lng?: number };
  rooms: WanderbedsRoom[];
  remarks?: string[];
}

export interface WanderbedsAvailabilityResponse {
  token: string;
  products: WanderbedsAvailabilityProduct[];
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

export interface WanderbedsBookRequest {
  token: string;
  client_reference: string;
  passengers: Array<{
    type: 'adt' | 'chd' | 'inf';
    group: string;
    title: string;
    firstname: string;
    lastname: string;
    nationality: string;
    birthdate?: string; // YYYY-MM-DD
  }>;
}

export interface WanderbedsBookingRoom {
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
  booking?: {
    status: 'NO' | 'RQ' | 'C' | 'X' | 'RJ';
    bookingReference?: string;
    reference?: string;
    clientReference?: string;
    confirmationNumber?: string;
  };
}

export interface WanderbedsBookResponse {
  token: string;
  contact?: {
    companyname?: string;
    firstname?: string;
    lastname?: string;
    email?: string;
    phone?: string;
    country?: string;
    state?: string;
    zip?: string;
    city?: string;
    address?: string;
  };
  passengers?: Array<{
    id: number;
    group: number;
    type: string;
    title?: string;
    firstname?: string;
    lastname?: string;
    nationality?: string;
    birthdate?: string;
    age?: number;
  }>;
  products: Array<{
    hotelId: string;
    name: string;
    starRating?: number;
    country?: string;
    cityName?: string;
    address?: string;
    location?: { lat?: number; lng?: number };
    rooms: WanderbedsBookingRoom[];
    remarks?: string[];
  }>;
}

export interface WanderbedsBookingInfoRequest {
  token?: string;
  booking_reference?: string;
  client_reference?: string;
}

export interface WanderbedsCancelRequest {
  booking_reference: string;
  reference?: string;
}

export interface WanderbedsCancelResponse extends WanderbedsBookResponse {
  success: boolean;
}

// ============================================================
// Client Functions
// ============================================================

/**
 * Check Wanderbeds vendor health
 */
export async function checkWanderbedsHealth(): Promise<ApiResponse<{ vendor: string; ts: string; status: string; hasData?: boolean }>> {
  return apiGet<ApiResponse<{ vendor: string; ts: string; status: string; hasData?: boolean }>>('/wanderbeds/health');
}

/**
 * Search hotels via Wanderbeds
 */
export async function searchWanderbedsHotels(request: WanderbedsSearchRequest): Promise<ApiResponse<WanderbedsSearchResponse>> {
  return apiPost<ApiResponse<WanderbedsSearchResponse>>('/wanderbeds/search', request);
}

/**
 * Check hotel availability
 * Per Wanderbeds docs (Availability.txt): Token must be in header, body is { rooms: [offerid strings] }
 */
export async function checkWanderbedsAvailability(request: WanderbedsAvailRequest): Promise<ApiResponse<WanderbedsAvailabilityResponse>> {
  // Backend expects token and rooms; it will put token in header per docs
  return apiPost<ApiResponse<WanderbedsAvailabilityResponse>>('/wanderbeds/avail', {
    token: request.token,
    rooms: request.rooms,
  });
}

/**
 * Book hotel (requires authentication)
 */
export async function bookWanderbedsHotel(request: WanderbedsBookRequest): Promise<ApiResponse<WanderbedsBookResponse>> {
  return apiPost<ApiResponse<WanderbedsBookResponse>>('/wanderbeds/book', request, { requireAuth: true });
}

/**
 * Get booking information (requires authentication)
 */
export async function getWanderbedsBookingInfo(request: WanderbedsBookingInfoRequest): Promise<ApiResponse<WanderbedsBookResponse>> {
  return apiPost<ApiResponse<WanderbedsBookResponse>>('/wanderbeds/booking-info', request, { requireAuth: true });
}

/**
 * Cancel booking (requires authentication)
 */
export async function cancelWanderbedsBooking(request: WanderbedsCancelRequest): Promise<ApiResponse<WanderbedsCancelResponse>> {
  return apiPost<ApiResponse<WanderbedsCancelResponse>>('/wanderbeds/cancel', request, { requireAuth: true });
}

// ============================================================
// Helper Functions
// ============================================================

/**
 * Extract error message from API response
 */
export function getWanderbedsError(response: ApiResponse<any>): string | null {
  if (response.ok || !response.error) return null;
  return response.error.message || response.error.code || 'Unknown error';
}

/**
 * Check if response is successful
 */
export function isWanderbedsSuccess<T>(response: ApiResponse<T>): response is ApiResponse<T> & { ok: true; data: T } {
  return response.ok === true && response.data !== null;
}

/**
 * Get API base URL for debugging
 */
export function getWanderbedsApiBase(): string {
  return `${apiBaseUrl}/wanderbeds`;
}
