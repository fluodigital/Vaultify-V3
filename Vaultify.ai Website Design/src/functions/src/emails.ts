import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Email service (SendGrid/Resend integration)
// TODO: Install @sendgrid/mail or resend npm package

// Send access request notification to admin
export const onAccessRequestCreated = functions.firestore
  .document('accessRequests/{requestId}')
  .onCreate(async (snap, context) => {
    const request = snap.data();
    const requestId = context.params.requestId;

    functions.logger.info(`New access request: ${requestId}`, request);

    // TODO: Send email to admin team
    // Example with SendGrid:
    /*
    const msg = {
      to: 'admin@vaultify.ai',
      from: 'noreply@vaultify.ai',
      subject: 'New Vaultify Access Request',
      html: `
        <h2>New Access Request</h2>
        <p><strong>Name:</strong> ${request.name}</p>
        <p><strong>Email:</strong> ${request.email}</p>
        <p><strong>Phone:</strong> ${request.phone || 'N/A'}</p>
        <p><strong>Company:</strong> ${request.company || 'N/A'}</p>
        <p><strong>Reason:</strong> ${request.reason || 'N/A'}</p>
        <p><a href="https://vaultify.ai/admin/requests/${requestId}">View Request</a></p>
      `,
    };
    await sgMail.send(msg);
    */

    return null;
  });

// Send booking confirmation email
export const sendBookingConfirmation = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { bookingId } = data;

  if (!bookingId) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing bookingId');
  }

  try {
    // Get booking details
    const bookingDoc = await admin.firestore().collection('bookings').doc(bookingId).get();
    
    if (!bookingDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Booking not found');
    }

    const booking = bookingDoc.data();

    // Verify ownership
    if (booking?.userId !== context.auth.uid) {
      throw new functions.https.HttpsError('permission-denied', 'Not authorized');
    }

    // Get user details
    const userDoc = await admin.firestore().collection('users').doc(context.auth.uid).get();
    const user = userDoc.data();

    functions.logger.info(`Sending booking confirmation for ${bookingId} to ${user?.email}`);

    // TODO: Send confirmation email
    /*
    const msg = {
      to: user?.email,
      from: 'concierge@vaultify.ai',
      subject: `Booking Confirmed: ${booking?.title}`,
      html: `
        <h2>Your booking is confirmed</h2>
        <p>Hi ${user?.displayName || 'there'},</p>
        <p>Your ${booking?.type} booking has been confirmed.</p>
        <h3>${booking?.title}</h3>
        <p>${booking?.description}</p>
        <p><strong>Total:</strong> ${booking?.price} ${booking?.currency}</p>
        <p><strong>Status:</strong> ${booking?.status}</p>
        <p>We'll be in touch with further details soon.</p>
        <p>Best regards,<br>The Vaultify Team</p>
      `,
    };
    await sgMail.send(msg);
    */

    return { success: true };
  } catch (error) {
    functions.logger.error('Error sending booking confirmation:', error);
    throw new functions.https.HttpsError('internal', 'Failed to send confirmation email');
  }
});

// Send welcome email to new users
export const sendWelcomeEmail = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  try {
    const userDoc = await admin.firestore().collection('users').doc(context.auth.uid).get();
    const user = userDoc.data();

    functions.logger.info(`Sending welcome email to ${user?.email}`);

    // TODO: Send welcome email with onboarding info
    /*
    const msg = {
      to: user?.email,
      from: 'alfred@vaultify.ai',
      subject: 'Welcome to Vaultify',
      html: `
        <h2>Welcome to Vaultify</h2>
        <p>Hi ${user?.displayName || 'there'},</p>
        <p>I'm Alfred, your personal AI concierge. I'm here to help you book private jets, luxury accommodations, exclusive experiences, and more.</p>
        <p>Simply start a conversation with me in the app, and I'll take care of everything.</p>
        <p>Looking forward to serving you.</p>
        <p>Best regards,<br>Alfred</p>
      `,
    };
    await sgMail.send(msg);
    */

    return { success: true };
  } catch (error) {
    functions.logger.error('Error sending welcome email:', error);
    throw new functions.https.HttpsError('internal', 'Failed to send welcome email');
  }
});
