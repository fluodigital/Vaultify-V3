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
exports.onUserDeleted = exports.onUserCreated = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
// Triggered when a new user is created
exports.onUserCreated = functions.auth.user().onCreate(async (user) => {
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
exports.onUserDeleted = functions.auth.user().onDelete(async (user) => {
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
//# sourceMappingURL=auth.js.map