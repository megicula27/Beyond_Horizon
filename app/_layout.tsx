import { Stack } from "expo-router";
import { QueryProvider } from "../src/providers/QueryProvider";
import { useInitializeAuth } from "../src/hooks/useInitializeAuth";

export default function RootLayout() {
  const { loading } = useInitializeAuth();

  if (loading) return null;
  return (
    <QueryProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </QueryProvider>
  );
}