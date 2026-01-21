"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelResponseSchema = exports.bookInfoResponseSchema = exports.bookResponseSchema = exports.availResponseSchema = exports.hotelSearchResponseSchema = exports.hotelSearchHotelSchema = exports.roomSchema = void 0;
const zod_1 = require("zod");
const priceSchema = zod_1.z.object({
    baseprice: zod_1.z.number(),
    tax: zod_1.z.number(),
    margin: zod_1.z.number(),
    total: zod_1.z.number(),
    currency: zod_1.z.string(),
});
const cancelPolicySchema = zod_1.z.object({
    from: zod_1.z.string(),
    amount: zod_1.z.number(),
    currency: zod_1.z.string(),
}).partial();
const additionalFeeSchema = zod_1.z.object({
    name: zod_1.z.string(),
    amount: zod_1.z.number(),
    currency: zod_1.z.string(),
});
exports.roomSchema = zod_1.z.object({
    offerid: zod_1.z.string(),
    roomindex: zod_1.z.number(),
    group: zod_1.z.number(),
    name: zod_1.z.string(),
    refundable: zod_1.z.boolean(),
    package: zod_1.z.boolean(),
    roomtype: zod_1.z.object({ code: zod_1.z.string(), name: zod_1.z.string() }).partial(),
    meal: zod_1.z.object({ code: zod_1.z.string(), name: zod_1.z.string() }).partial(),
    view: zod_1.z.object({ code: zod_1.z.string(), name: zod_1.z.string() }).partial(),
    price: priceSchema,
    cancelpolicy: cancelPolicySchema.optional(),
    additionalfees: zod_1.z.object({
        breakdown: zod_1.z.array(additionalFeeSchema).optional(),
        total: zod_1.z.number().optional(),
        currency: zod_1.z.string().optional(),
    }).partial().optional(),
    remarks: zod_1.z.array(zod_1.z.string()).optional(),
});
exports.hotelSearchHotelSchema = zod_1.z.object({
    hotelid: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).transform((v) => String(v)),
    hotelname: zod_1.z.string().optional(),
    accommodation: zod_1.z.string().optional(),
    starrating: zod_1.z.number().optional(),
    country: zod_1.z.string().optional(),
    cityid: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).optional(),
    cityname: zod_1.z.string().optional(),
    address: zod_1.z.string().optional(),
    location: zod_1.z.object({
        lat: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).optional(),
        lon: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).optional(),
    }).partial(),
    rooms: zod_1.z.array(exports.roomSchema).optional(),
    remarks: zod_1.z.array(zod_1.z.string()).optional(),
});
exports.hotelSearchResponseSchema = zod_1.z.object({
    token: zod_1.z.string().optional(),
    time: zod_1.z.string().optional(),
    server: zod_1.z.string().optional(),
    count: zod_1.z.number().optional(),
    hotels: zod_1.z.array(exports.hotelSearchHotelSchema).optional(),
});
const productSchema = zod_1.z.object({
    hotelid: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).transform((v) => String(v)),
    hotelname: zod_1.z.string().optional(),
    accommodation: zod_1.z.string().optional(),
    starrating: zod_1.z.number().optional(),
    country: zod_1.z.string().optional(),
    cityid: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).optional(),
    cityname: zod_1.z.string().optional(),
    address: zod_1.z.string().optional(),
    location: zod_1.z.object({
        lat: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).optional(),
        lon: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]).optional(),
    }).partial(),
    rooms: zod_1.z.array(exports.roomSchema).optional(),
    remarks: zod_1.z.array(zod_1.z.string()).optional(),
});
exports.availResponseSchema = zod_1.z.object({
    token: zod_1.z.string().optional(),
    time: zod_1.z.string().optional(),
    server: zod_1.z.string().optional(),
    data: zod_1.z.object({
        success: zod_1.z.boolean().optional(),
        products: zod_1.z.array(productSchema).optional(),
        summary: zod_1.z.object({
            currency: zod_1.z.string().optional(),
            nettotal: zod_1.z.number().optional(),
            tax: zod_1.z.number().optional(),
            margin: zod_1.z.number().optional(),
            total: zod_1.z.number().optional(),
            paymentplan: zod_1.z.record(zod_1.z.string(), zod_1.z.number()).optional(),
            taxinfo: zod_1.z.array(zod_1.z.any()).optional(),
        }).partial().optional(),
        required: zod_1.z.object({
            nationality: zod_1.z.union([zod_1.z.number(), zod_1.z.string()]).optional(),
            chdbirthdate: zod_1.z.union([zod_1.z.number(), zod_1.z.string()]).optional(),
        }).partial().optional(),
    }).optional(),
});
exports.bookResponseSchema = zod_1.z.object({
    client_reference: zod_1.z.string().optional(),
    booking_reference: zod_1.z.string().optional(),
});
exports.bookInfoResponseSchema = zod_1.z.object({
    token: zod_1.z.string().optional(),
    time: zod_1.z.string().optional(),
    server: zod_1.z.string().optional(),
    data: zod_1.z.object({
        success: zod_1.z.boolean().optional(),
        contact: zod_1.z.any().optional(),
        passengers: zod_1.z.array(zod_1.z.any()).optional(),
        products: zod_1.z.array(productSchema).optional(),
    }).partial().optional(),
});
exports.cancelResponseSchema = exports.bookInfoResponseSchema;
//# sourceMappingURL=wanderbedsSchemas.js.map