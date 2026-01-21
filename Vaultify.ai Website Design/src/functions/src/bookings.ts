import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Create a new booking
export const createBooking = functions.https.onCall(async (data, context) => {
  // Verify authentication
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated to create bookings'
    );
  }

  const userId = context.auth.uid;
  const { type, title, description, price, currency, paymentMethod, bookingDate, details } = data;

  // Validate input
  if (!type || !title || !price || !currency) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Missing required booking fields'
    );
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
  } catch (error) {
    functions.logger.error('Error creating booking:', error);
    throw new functions.https.HttpsError('internal', 'Failed to create booking');
  }
});

// Update booking status
export const updateBookingStatus = functions.https.onCall(async (data, context) => {
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
    if (booking?.userId !== context.auth.uid) {
      // Check if user is admin
      const userDoc = await admin.firestore().collection('users').doc(context.auth.uid).get();
      const userData = userDoc.data();
      
      if (userData?.role !== 'admin') {
        throw new functions.https.HttpsError('permission-denied', 'Not authorized');
      }
    }

    await bookingRef.update({
      status,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    functions.logger.info(`Booking ${bookingId} status updated to ${status}`);

    return { success: true };
  } catch (error) {
    functions.logger.error('Error updating booking:', error);
    throw new functions.https.HttpsError('internal', 'Failed to update booking');
  }
});

// Get booking details (with additional verification data)
export const getBookingDetails = functions.https.onCall(async (data, context) => {
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
    if (booking?.userId !== context.auth.uid) {
      throw new functions.https.HttpsError('permission-denied', 'Not authorized');
    }

    return {
      success: true,
      booking: {
        id: bookingDoc.id,
        ...booking,
      },
    };
  } catch (error) {
    functions.logger.error('Error fetching booking:', error);
    throw new functions.https.HttpsError('internal', 'Failed to fetch booking');
  }
});
