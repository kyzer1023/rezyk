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
    const token = credential?.accessToken;
    const user = result.user;
    console.log({ user, token });

    return { user, token };
  } catch (error) {
    console.error("Error during Google sign-in:", error);
    throw error;
  }
};
