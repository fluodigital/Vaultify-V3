import { z } from 'zod';

const priceSchema = z.object({
  baseprice: z.number(),
  tax: z.number(),
  margin: z.number(),
  total: z.number(),
  currency: z.string(),
});

const cancelPolicySchema = z.object({
  from: z.string(),
  amount: z.number(),
  currency: z.string(),
}).partial();

const additionalFeeSchema = z.object({
  name: z.string(),
  amount: z.number(),
  currency: z.string(),
});

export const roomSchema = z.object({
  offerid: z.string(),
  roomindex: z.number(),
  group: z.number(),
  name: z.string(),
  refundable: z.boolean(),
  package: z.boolean(),
  roomtype: z.object({ code: z.string(), name: z.string() }).partial(),
  meal: z.object({ code: z.string(), name: z.string() }).partial(),
  view: z.object({ code: z.string(), name: z.string() }).partial(),
  price: priceSchema,
  cancelpolicy: cancelPolicySchema.optional(),
  additionalfees: z.object({
    breakdown: z.array(additionalFeeSchema).optional(),
    total: z.number().optional(),
    currency: z.string().optional(),
  }).partial().optional(),
  remarks: z.array(z.string()).optional(),
});

export const hotelSearchHotelSchema = z.object({
  hotelid: z.union([z.string(), z.number()]).transform((v) => String(v)),
  hotelname: z.string().optional(),
  accommodation: z.string().optional(),
  starrating: z.number().optional(),
  country: z.string().optional(),
  cityid: z.union([z.string(), z.number()]).optional(),
  cityname: z.string().optional(),
  address: z.string().optional(),
  location: z.object({
    lat: z.union([z.string(), z.number()]).optional(),
    lon: z.union([z.string(), z.number()]).optional(),
  }).partial(),
  rooms: z.array(roomSchema).optional(),
  remarks: z.array(z.string()).optional(),
});

export const hotelSearchResponseSchema = z.object({
  token: z.string().optional(),
  time: z.string().optional(),
  server: z.string().optional(),
  count: z.number().optional(),
  hotels: z.array(hotelSearchHotelSchema).optional(),
});

const productSchema = z.object({
  hotelid: z.union([z.string(), z.number()]).transform((v) => String(v)),
  hotelname: z.string().optional(),
  accommodation: z.string().optional(),
  starrating: z.number().optional(),
  country: z.string().optional(),
  cityid: z.union([z.string(), z.number()]).optional(),
  cityname: z.string().optional(),
  address: z.string().optional(),
  location: z.object({
    lat: z.union([z.string(), z.number()]).optional(),
    lon: z.union([z.string(), z.number()]).optional(),
  }).partial(),
  rooms: z.array(roomSchema).optional(),
  remarks: z.array(z.string()).optional(),
});

export const availResponseSchema = z.object({
  token: z.string().optional(),
  time: z.string().optional(),
  server: z.string().optional(),
  data: z.object({
    success: z.boolean().optional(),
    products: z.array(productSchema).optional(),
    summary: z.object({
      currency: z.string().optional(),
      nettotal: z.number().optional(),
      tax: z.number().optional(),
      margin: z.number().optional(),
      total: z.number().optional(),
      paymentplan: z.record(z.string(), z.number()).optional(),
      taxinfo: z.array(z.any()).optional(),
    }).partial().optional(),
    required: z.object({
      nationality: z.union([z.number(), z.string()]).optional(),
      chdbirthdate: z.union([z.number(), z.string()]).optional(),
    }).partial().optional(),
  }).optional(),
});

export const bookResponseSchema = z.object({
  client_reference: z.string().optional(),
  booking_reference: z.string().optional(),
});

export const bookInfoResponseSchema = z.object({
  token: z.string().optional(),
  time: z.string().optional(),
  server: z.string().optional(),
  data: z.object({
    success: z.boolean().optional(),
    contact: z.any().optional(),
    passengers: z.array(z.any()).optional(),
    products: z.array(productSchema).optional(),
  }).partial().optional(),
});

export const cancelResponseSchema = bookInfoResponseSchema;
