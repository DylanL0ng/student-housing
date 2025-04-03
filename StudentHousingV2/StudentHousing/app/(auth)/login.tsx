import React, { useEffect } from "react";
import { StyleSheet, Text, Platform } from "react-native";
import supabase from "@/lib/supabase";
import {
  GoogleSignin,
  statusCodes,
  isErrorWithCode,
  isSuccessResponse,
  isNoSavedCredentialFoundResponse,
  GoogleSigninButton,
} from "@react-native-google-signin/google-signin";
import * as AppleAuthentication from 'expo-apple-authentication';

import { Button, View, H1 } from 'tamagui';

const supabaseLogin = async (provider: 'google' | 'apple', token: string) => {
  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: provider,
    token: token,
  });
}

const handleAppleSignIn = async () => {
  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    if (credential.identityToken) {
      supabaseLogin('apple', credential.identityToken);
    }
    console.log("Apple credential", credential);
  } catch (e) {
    if (e.code === 'ERR_REQUEST_CANCELED') {
      // handle that the user canceled the sign-in flow
    } else {
      // handle other errors
    }
  }
}

const handleAndroidSignIn = async () => {
  try {
    await GoogleSignin.hasPlayServices();
    const response = await GoogleSignin.signIn();
    if (isSuccessResponse(response)) {

      // console.log("Google response", response);
      if (response.data.idToken) {
        supabaseLogin('google', response.data.idToken);
      }
    } else if (isNoSavedCredentialFoundResponse(response)) {
      // Android and Apple only.
      // No saved credential found (user has not signed in yet, or they revoked access)
      // call `createAccount()`
    }
  } catch (error) {
    // console.error(error);
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


const RenderLoginButton = ({os = 'ios'}) => {
  if (os === "ios") {
    return (
      <Button onPress={handleAndroidSignIn}>
        Login
        </Button>
    )
    // return (
    //   <AppleAuthentication.AppleAuthenticationButton
    //     buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
    //     buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE}
    //     cornerRadius={5}
    //     onPress={handleAppleSignIn}
    //   />
    // )
  } else if (os === "android") {
    return (<GoogleSigninButton
        size={GoogleSigninButton.Size.Wide}
        color={GoogleSigninButton.Color.Dark}
        onPress={handleAndroidSignIn}
      />)
  }
}

const LoginScreen = () => {
  GoogleSignin.configure({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID!,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID!,
    offlineAccess: true,
  });

  return (
    <View flex={1} bg={"$background"} justify="center" items="center">
      <H1 size={"$4"}>Student Housing</H1>
      <RenderLoginButton os='ios' />
    </View>
  );
};

export default LoginScreen;
