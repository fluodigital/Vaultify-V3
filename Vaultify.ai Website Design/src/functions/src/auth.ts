import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Triggered when a new user is created
export const onUserCreated = functions.auth.user().onCreate(async (user) => {
  const { uid, email, displayName, photoURL } = user;

  // Create user profile in Firestore
  await admin.firestore().collection('users').doc(uid).set({
    uid,
    email,
    displayName: displayName || '',
    photoURL: photoURL || '',
    membershipTier: 'standard',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  // Send welcome email
  // TODO: Implement welcome email via SendGrid/Resend

  functions.logger.info(`User created: ${uid}`);
});

// Triggered when a user is deleted
export const onUserDeleted = functions.auth.user().onDelete(async (user) => {
  const { uid } = user;

  // Delete user data from Firestore
  const batch = admin.firestore().batch();

  // Delete user profile
  batch.delete(admin.firestore().collection('users').doc(uid));

  // Delete user's bookings
  const bookingsSnapshot = await admin
    .firestore()
    .collection('bookings')
    .where('userId', '==', uid)
    .get();
  
  bookingsSnapshot.forEach((doc) => {
    batch.delete(doc.ref);
  });

  // Delete user's conversations
  const conversationsSnapshot = await admin
    .firestore()
    .collection('conversations')
    .where('userId', '==', uid)
    .get();
  
  conversationsSnapshot.forEach((doc) => {
    batch.delete(doc.ref);
  });

  await batch.commit();

  functions.logger.info(`User deleted: ${uid}`);
});
