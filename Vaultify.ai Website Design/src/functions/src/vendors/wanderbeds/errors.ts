/**
 * Wanderbeds API Error Types
 * 
 * Clean error handling for Wanderbeds integration
 */

export class WanderbedsClientError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 502,
    public upstreamStatus?: number,
    public upstreamMs?: number,
  ) {
    super(message);
    this.name = 'WanderbedsClientError';
  }
}

/**
 * Convert vendor error to internal error
 */
export function normalizeVendorError(err: any, endpoint: string): WanderbedsClientError {
  if (err instanceof WanderbedsClientError) {
    return err;
  }

  const status = err?.status || err?.statusCode || err?.response?.status;
  const message = err?.message || err?.response?.data?.message || 'Wanderbeds request failed';

  if (status === 401) {
    return new WanderbedsClientError('Invalid Wanderbeds credentials', 'wanderbeds_auth_error', 401, status);
  }

  if (status === 400) {
    return new WanderbedsClientError(`Invalid request to ${endpoint}`, 'wanderbeds_bad_request', 400, status);
  }

  if (status === 404) {
    return new WanderbedsClientError(`Resource not found: ${endpoint}`, 'wanderbeds_not_found', 404, status);
  }

  if (status === 408 || err?.code === 'ECONNABORTED') {
    return new WanderbedsClientError('Wanderbeds request timed out', 'wanderbeds_timeout', 408, status);
  }

  if (status >= 500) {
    return new WanderbedsClientError('Wanderbeds server error', 'wanderbeds_server_error', 502, status);
  }

  return new WanderbedsClientError(message, 'wanderbeds_unknown_error', 502, status);
}
