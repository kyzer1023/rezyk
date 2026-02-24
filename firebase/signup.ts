import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../firebase";

export const googleSignIn = async () => {
  try {
    const provider = new GoogleAuthProvider();

    // add more scope for google classroom api and google form api here
    provider.addScope(
      "https://www.googleapis.com/auth/classroom.student-submissions.students.readonly",
    );

    const result = await signInWithPopup(auth, provider);

    const credential = GoogleAuthProvider.credentialFromResult(result);
    const accessToken = credential?.accessToken;
    const firebaseIdToken = await result.user.getIdToken();

    if (!accessToken) {
      throw new Error("Failed to obtain access token from Google.");
    }

    return { firebaseIdToken, accessToken };
  } catch (error) {
    console.error("Error during Google sign-in:", error);
    throw error;
  }
};
