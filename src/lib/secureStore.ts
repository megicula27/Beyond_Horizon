import * as SecureStore from "expo-secure-store";

const ACCESS_TOKEN_KEY = "mn_access_token";
const REFRESH_TOKEN_KEY = "mn_refresh_token";

export async function setTokens(accessToken: string, refreshToken: string) {
  try {
    await Promise.all([
      SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken),
      SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken),
    ]);
  } catch (e) {
    console.error("Error saving tokens", e);
  }
}

export async function getAccessToken() {
  try {
    return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  } catch (e) {
    return null;
  }
}

export async function getRefreshToken() {
  try {
    return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  } catch (e) {
    console.error("Error reading refresh token", e);
    return null;
  }
}

export async function clearTokens() {
  try {
    await Promise.all([
      SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
      SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
    ]);
  } catch (e) {
    console.error("Error clearing tokens", e);
  }
}
