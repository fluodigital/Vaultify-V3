/**
 * Wanderbeds Integration - Clean API Layer
 * 
 * Exports for Wanderbeds vendor integration
 */

export { wanderbedsRequest } from './client';
export { WanderbedsClientError, normalizeVendorError } from './errors';
export * from './types';
export {
  mapSearchResponse,
  mapAvailabilityResponse,
  mapBookResponse,
  mapCancelResponse,
  type InternalHotel,
  type InternalRoom,
  type InternalSearchResult,
  type InternalAvailabilityResult,
} from './mappers';
