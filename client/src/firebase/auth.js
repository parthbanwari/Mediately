// client/src/auth.js
import { auth, db } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  updatePassword,
  sendEmailVerification,
  signInWithPhoneNumber,
  RecaptchaVerifier,
} from "firebase/auth";
import { doc,setDoc,getDoc } from "firebase/firestore";

// Email/password signup
export const doCreateUserWithEmailAndPassword = async (email, password, name, role) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  await setDoc(doc(db, "accounts", user.uid), {
    Name: name,
    Role: role,
    Email: email,
    profileCompleted: false
  });

  return userCredential;
};
export const getUserInfo = async (uid) => {
  if (!uid || typeof uid !== 'string') {
    throw new Error("Invalid UID passed to getUserInfo");
  }

  const docRef = doc(db, "accounts", uid);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
      uid: uid,
      name: data.name || "",
      role: (data.role || "").trim(),
      profileCompleted: data.profileCompleted || false
    };
  } else {
    throw new Error("User info not found in Firestore");
  }
};

// Email/password login
export const doSignInWithEmailAndPassword = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

// Google login
export const doSignInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  const user = result.user;

  const accountRef = doc(db, "accounts", user.uid);
  const snap = await getDoc(accountRef);

  if (!snap.exists()) {
    // Default role = client
    await setDoc(accountRef, {
      Name: user.displayName || '',
      Email: user.email,
      Role: 'client',
      profileCompleted: true
    });
  }

  return result;
};


// Logout
export const doSignOut = () => {
  return auth.signOut();
};

// Password reset
export const doPasswordReset = (email) => {
  return sendPasswordResetEmail(auth, email);
};

// Password change
export const doPasswordChange = (password) => {
  return updatePassword(auth.currentUser, password);
};

// Email verification
export const doSendEmailVerification = () => {
  return sendEmailVerification(auth.currentUser, {
    url: `${window.location.origin}/home`, // ✅ corrected from `$(...)` to `${...}`
  });
};

// 🔢 Phone login (send OTP)
export const doSignInWithPhoneNumber = async (phoneNumber, appVerifier) => {
  return signInWithPhoneNumber(auth, phoneNumber, appVerifier);
};

// 🛡️ Create RecaptchaVerifier instance
export const createRecaptchaVerifier = (elementId) => {
  if (!window.recaptchaVerifier) {
    window.recaptchaVerifier = new RecaptchaVerifier(
      elementId,
      {
        size: "invisible",
        callback: (response) => {
          console.log("reCAPTCHA resolved:", response);
        },
      },
      auth
    );
  }
  return window.recaptchaVerifier;
};
