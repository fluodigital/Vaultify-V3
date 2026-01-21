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
exports.getBookingDetails = exports.updateBookingStatus = exports.createBooking = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
// Create a new booking
exports.createBooking = functions.https.onCall(async (data, context) => {
    // Verify authentication
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated to create bookings');
    }
    const userId = context.auth.uid;
    const { type, title, description, price, currency, paymentMethod, bookingDate, details } = data;
    // Validate input
    if (!type || !title || !price || !currency) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing required booking fields');
    }
    try {
        // Create booking document
        const bookingRef = await admin.firestore().collection('bookings').add({
            userId,
            type,
            title,
            description: description || '',
            price,
            currency,
            paymentMethod: paymentMethod || 'card',
            status: 'pending',
            bookingDate: bookingDate || null,
            details: details || {},
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        functions.logger.info(`Booking created: ${bookingRef.id} for user ${userId}`);
        // Send confirmation email to user
        // TODO: Implement email notification
        return {
            success: true,
            bookingId: bookingRef.id,
        };
    }
    catch (error) {
        functions.logger.error('Error creating booking:', error);
        throw new functions.https.HttpsError('internal', 'Failed to create booking');
    }
});
// Update booking status
exports.updateBookingStatus = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { bookingId, status } = data;
    if (!bookingId || !status) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing bookingId or status');
    }
    try {
        const bookingRef = admin.firestore().collection('bookings').doc(bookingId);
        const bookingDoc = await bookingRef.get();
        if (!bookingDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'Booking not found');
        }
        const booking = bookingDoc.data();
        // Verify ownership or admin
        if ((booking === null || booking === void 0 ? void 0 : booking.userId) !== context.auth.uid) {
            // Check if user is admin
            const userDoc = await admin.firestore().collection('users').doc(context.auth.uid).get();
            const userData = userDoc.data();
            if ((userData === null || userData === void 0 ? void 0 : userData.role) !== 'admin') {
                throw new functions.https.HttpsError('permission-denied', 'Not authorized');
            }
        }
        await bookingRef.update({
            status,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        functions.logger.info(`Booking ${bookingId} status updated to ${status}`);
        return { success: true };
    }
    catch (error) {
        functions.logger.error('Error updating booking:', error);
        throw new functions.https.HttpsError('internal', 'Failed to update booking');
    }
});
// Get booking details (with additional verification data)
exports.getBookingDetails = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { bookingId } = data;
    if (!bookingId) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing bookingId');
    }
    try {
        const bookingDoc = await admin.firestore().collection('bookings').doc(bookingId).get();
        if (!bookingDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'Booking not found');
        }
        const booking = bookingDoc.data();
        // Verify ownership
        if ((booking === null || booking === void 0 ? void 0 : booking.userId) !== context.auth.uid) {
            throw new functions.https.HttpsError('permission-denied', 'Not authorized');
        }
        return {
            success: true,
            booking: Object.assign({ id: bookingDoc.id }, booking),
        };
    }
    catch (error) {
        functions.logger.error('Error fetching booking:', error);
        throw new functions.https.HttpsError('internal', 'Failed to fetch booking');
    }
});
//# sourceMappingURL=bookings.js.map