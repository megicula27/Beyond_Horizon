import { Redirect, Stack } from "expo-router";
import { useAuthStore } from "../../src/features/auth/store";

export default function ProtectedLayout() {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}