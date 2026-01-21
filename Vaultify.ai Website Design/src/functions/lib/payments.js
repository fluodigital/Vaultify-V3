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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCryptoPayment = exports.stripeWebhook = exports.createPaymentIntent = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const stripe_1 = __importDefault(require("stripe"));
// Initialize Stripe
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2023-10-16',
});
// Create Stripe payment intent
exports.createPaymentIntent = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { amount, currency, bookingId } = data;
    if (!amount || !currency || !bookingId) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing required payment fields');
    }
    try {
        // Verify booking exists and belongs to user
        const bookingDoc = await admin.firestore().collection('bookings').doc(bookingId).get();
        if (!bookingDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'Booking not found');
        }
        const booking = bookingDoc.data();
        if ((booking === null || booking === void 0 ? void 0 : booking.userId) !== context.auth.uid) {
            throw new functions.https.HttpsError('permission-denied', 'Not authorized');
        }
        // Create Stripe payment intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Convert to cents
            currency: currency.toLowerCase(),
            metadata: {
                bookingId,
                userId: context.auth.uid,
            },
            automatic_payment_methods: {
                enabled: true,
            },
        });
        // Update booking with payment intent ID
        await admin.firestore().collection('bookings').doc(bookingId).update({
            paymentIntentId: paymentIntent.id,
            paymentStatus: 'pending',
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        functions.logger.info(`Payment intent created: ${paymentIntent.id} for booking ${bookingId}`);
        return {
            success: true,
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
        };
    }
    catch (error) {
        functions.logger.error('Error creating payment intent:', error);
        throw new functions.https.HttpsError('internal', 'Failed to create payment intent');
    }
});
// Handle Stripe webhook events
exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
    let event;
    try {
        event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret);
    }
    catch (err) {
        functions.logger.error('Webhook signature verification failed:', err);
        res.status(400).send(`Webhook Error: ${err}`);
        return;
    }
    // Handle the event
    switch (event.type) {
        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object;
            const bookingId = paymentIntent.metadata.bookingId;
            if (bookingId) {
                // Update booking status
                await admin.firestore().collection('bookings').doc(bookingId).update({
                    status: 'confirmed',
                    paymentStatus: 'paid',
                    paidAt: admin.firestore.FieldValue.serverTimestamp(),
                    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                });
                functions.logger.info(`Payment succeeded for booking ${bookingId}`);
                // TODO: Send confirmation email
            }
            break;
        case 'payment_intent.payment_failed':
            const failedPayment = event.data.object;
            const failedBookingId = failedPayment.metadata.bookingId;
            if (failedBookingId) {
                await admin.firestore().collection('bookings').doc(failedBookingId).update({
                    paymentStatus: 'failed',
                    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                });
                functions.logger.error(`Payment failed for booking ${failedBookingId}`);
                // TODO: Send payment failed email
            }
            break;
        default:
            functions.logger.info(`Unhandled event type: ${event.type}`);
    }
    res.json({ received: true });
});
// Create Circle stablecoin payment
exports.createCryptoPayment = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { amount, currency, bookingId, stablecoin } = data;
    if (!amount || !currency || !bookingId || !stablecoin) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing required payment fields');
    }
    try {
        // Verify booking
        const bookingDoc = await admin.firestore().collection('bookings').doc(bookingId).get();
        if (!bookingDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'Booking not found');
        }
        const booking = bookingDoc.data();
        if ((booking === null || booking === void 0 ? void 0 : booking.userId) !== context.auth.uid) {
            throw new functions.https.HttpsError('permission-denied', 'Not authorized');
        }
        // TODO: Integrate with Circle API for USDC/USDT payments
        // This is a placeholder for Circle API integration
        const cryptoPaymentId = `crypto_${Date.now()}`;
        // Update booking with crypto payment info
        await admin.firestore().collection('bookings').doc(bookingId).update({
            cryptoPaymentId,
            paymentMethod: 'crypto',
            stablecoin,
            paymentStatus: 'pending',
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        functions.logger.info(`Crypto payment created for booking ${bookingId}`);
        return {
            success: true,
            paymentId: cryptoPaymentId,
            // TODO: Return Circle payment details (wallet address, QR code, etc.)
        };
    }
    catch (error) {
        functions.logger.error('Error creating crypto payment:', error);
        throw new functions.https.HttpsError('internal', 'Failed to create crypto payment');
    }
});
//# sourceMappingURL=payments.js.map