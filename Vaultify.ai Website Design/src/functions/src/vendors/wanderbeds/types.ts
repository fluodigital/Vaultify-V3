/**
 * Wanderbeds Vendor Types
 * 
 * Minimal types representing vendor API shapes (as-is from Wanderbeds)
 */

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
  timout?: string; // Note: typo in vendor API (not "timeout")
}

export interface WanderbedsSearchResponse {
  token: string;
  time: string;
  server: string;
  count: number;
  hotels: Array<{
    hotelid: string;
    hotelname?: string;
    accommodation?: string;
    starrating?: number;
    country?: string;
    cityid?: string;
    cityname?: string;
    address?: string;
    location?: {
      lat: string;
      lon: string;
    };
    rooms?: Array<{
      offerid: string;
      roomindex: number;
      group: number;
      name?: string;
      refundable?: boolean;
      package?: boolean;
      roomtype?: { code: string; name: string };
      meal?: { code: string; name: string };
      view?: { code: string; name: string };
      price: {
        baseprice: number;
        tax: number;
        margin: number;
        total: number;
        currency: string;
      };
      cancelpolicy?: {
        from: string;
        amount: number;
        currency: string;
      };
      additionalfees?: {
        breakdown?: Array<{ name: string; amount: number; currency: string }>;
        total?: number;
        currency?: string;
      };
      remarks?: string[];
    }>;
    remarks?: string[];
  }>;
}

export interface WanderbedsAvailRequest {
  rooms: string[]; // offer IDs
}

export interface WanderbedsAvailResponse {
  token: string;
  time: string;
  server: string;
  data: {
    success: boolean;
    products: Array<{
      hotelid: string;
      hotelname?: string;
      accommodation?: string;
      starrating?: number;
      country?: string;
      cityid?: string;
      cityname?: string;
      address?: string;
      location?: { lat: string; lon: string };
      rooms?: WanderbedsSearchResponse['hotels'][0]['rooms'];
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
      nationality?: number | string;
      chdbirthdate?: number | string;
    };
  };
}

export interface WanderbedsBookRequest {
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

export interface WanderbedsBookResponse {
  token: string;
  time: string;
  server: string;
  data: {
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
    products?: Array<{
      hotelid: string;
      hotelname?: string;
      accommodation?: string;
      starrating?: number;
      country?: string;
      cityid?: string;
      cityname?: string;
      address?: string;
      location?: { lat: string; lon: string };
      rooms?: Array<{
        offerid: string;
        roomindex: number;
        group: number;
        name?: string;
        refundable?: boolean;
        package?: boolean;
        roomtype?: { code: string; name: string };
        meal?: { code: string; name: string };
        view?: { code: string; name: string };
        price: {
          baseprice: number;
          tax: number;
          margin: number;
          total: number;
          currency: string;
        };
        cancelpolicy?: {
          from: string;
          amount: number;
          currency: string;
        };
        booking?: {
          status: 'NO' | 'RQ' | 'C' | 'X' | 'RJ';
          booking_reference?: string;
          reference?: string;
          client_reference?: string;
          confirmation_number?: string;
        };
        remarks?: string[];
      }>;
      remarks?: string[];
    }>;
  };
}

export interface WanderbedsBookingInfoRequest {
  booking_reference?: string;
  client_reference?: string;
}

export interface WanderbedsBookingInfoResponse extends WanderbedsBookResponse {}

export interface WanderbedsCancelRequest {
  booking_reference: string;
  reference?: string; // Optional room reference
}

export interface WanderbedsCancelResponse {
  token: string;
  time: string;
  server: string;
  data: {
    success: boolean;
    contact?: WanderbedsBookResponse['data']['contact'];
    passengers?: WanderbedsBookResponse['data']['passengers'];
    products?: WanderbedsBookResponse['data']['products'];
  };
}
