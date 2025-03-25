import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import supabase from "../lib/supabase";
import {
  GoogleSignin,
  statusCodes,
  isErrorWithCode,
  isSuccessResponse,
  isNoSavedCredentialFoundResponse,
  GoogleSigninButton,
} from "@react-native-google-signin/google-signin";

const signIn = async () => {
  try {
    await GoogleSignin.hasPlayServices();
    console.log("has play services");
    const response = await GoogleSignin.signIn();
    console.log(response);
    if (isSuccessResponse(response)) {
      // read user's info
      if (response.data.idToken) {
        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: "google",
          token: response.data.idToken,
        });
        console.log(error, data);
      }
    } else if (isNoSavedCredentialFoundResponse(response)) {
      // Android and Apple only.
      // No saved credential found (user has not signed in yet, or they revoked access)
      // call `createAccount()`
    }
  } catch (error) {
    console.error(error);
    if (isErrorWithCode(error)) {
      switch (error.code) {
        // case statusCodes.ONE_TAP_START_FAILED:
        // Android-only, you probably have hit rate limiting.
        // You can still call `presentExplicitSignIn` in this case.
        //   break;
        case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
          // Android: play services not available or outdated.
          // Get more details from `error.userInfo`.
          // Web: when calling an unimplemented api (requestAuthorization)
          // or when the Google Client Library is not loaded yet.
          break;
        default:
        // something else happened
      }
    } else {
      // an error that's not related to google sign in occurred
    }
  }
};

const Login = () => {
  GoogleSignin.configure({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID!,
  });
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Student Housing</Text>
      <GoogleSigninButton
        size={GoogleSigninButton.Size.Wide}
        color={GoogleSigninButton.Color.Dark}
        onPress={signIn}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default Login;
