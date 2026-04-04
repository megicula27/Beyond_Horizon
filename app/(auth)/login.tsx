import { View, Text, TextInput, Pressable, StyleSheet, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { colors } from "../../src/theme/colors";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginFormValues } from "../../src/features/auth/schema";
import { loginApi } from "../../src/features/auth/api";
import { setTokens } from "../../src/lib/secureStore";
import { useAuthStore } from "../../src/features/auth/store";
import { router } from "expo-router";

export default function LoginScreen() {
  const { setSession } = useAuthStore();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { imoNumber: "", crewId: "", password: "" },
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      const res = await loginApi(values);
      await setTokens(res.accessToken, res.refreshToken);
      setSession(res.user);

      if (res.user.role === "HOD") router.replace("/(protected)/hod");
      else if (res.user.role === "OFFICER") router.replace("/(protected)/officer");
      else router.replace("/(protected)/admin");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log("login error", {
          message: error.message,
          code: error.code,
          status: error.response?.status,
          data: error.response?.data,
        });
      } else {
        console.log("login error", error);
      }

      const message = axios.isAxiosError(error)
        ? error.response?.data?.message ?? error.message
        : "Invalid credentials or server error";

      Alert.alert("Login failed", message);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <LinearGradient colors={[colors.primary, colors.primaryContainer]} style={styles.logoBox}>
            <MaterialCommunityIcons name="anchor" size={34} color={colors.onPrimary} />
          </LinearGradient>
          <Text style={styles.brand}>The Nautical Horizon</Text>
          <Text style={styles.subBrand}>MERCHANT NAVY OPERATIONS PORTAL</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Vessel Sign-In</Text>
          <Text style={styles.subtitle}>Authorized personnel only. Logs are recorded.</Text>

          <View style={styles.field}>
            <Text style={styles.label}>IMO NUMBER</Text>
            <Controller
              control={control}
              name="imoNumber"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  placeholder="e.g. IMO-9074729"
                  placeholderTextColor="#9ca3af"
                  style={styles.input}
                  autoCapitalize="characters"
                />
              )}
            />
            {!!errors.imoNumber && <Text style={styles.error}>{errors.imoNumber.message}</Text>}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>CREW ID</Text>
            <Controller
              control={control}
              name="crewId"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  placeholder="e.g. CREW-1001"
                  placeholderTextColor="#9ca3af"
                  style={styles.input}
                  autoCapitalize="characters"
                />
              )}
            />
            {!!errors.crewId && <Text style={styles.error}>{errors.crewId.message}</Text>}
          </View>

          <View style={styles.field}>
            <View style={styles.rowBetween}>
              <Text style={styles.label}>ACCESS KEY</Text>
              <Pressable><Text style={styles.reset}>EMERGENCY RESET</Text></Pressable>
            </View>
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  placeholder="••••••••••••"
                  placeholderTextColor="#9ca3af"
                  secureTextEntry
                  style={styles.input}
                />
              )}
            />
            {!!errors.password && <Text style={styles.error}>{errors.password.message}</Text>}
          </View>

          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={18} color="#1f4c55" />
            <Text style={styles.infoText}>Current bridge location synced via encrypted GNSS. Satellite link active.</Text>
          </View>

          <Pressable style={[styles.cta, isSubmitting && { opacity: 0.7 }]} onPress={handleSubmit(onSubmit)} disabled={isSubmitting}>
            <Text style={styles.ctaText}>{isSubmitting ? "Connecting..." : "Establish Connection"}</Text>
            <Ionicons name="arrow-forward" size={24} color={colors.onPrimary} />
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { padding: 20, paddingBottom: 32 },
  header: { alignItems: "center", marginTop: 18, marginBottom: 24 },
  logoBox: { width: 64, height: 64, borderRadius: 12, alignItems: "center", justifyContent: "center", marginBottom: 14 },
  brand: { fontSize: 44, fontWeight: "800", color: colors.primary, letterSpacing: -1 },
  subBrand: { marginTop: 8, fontSize: 13, letterSpacing: 3, color: colors.textMuted },
  card: { backgroundColor: colors.surface, borderRadius: 16, padding: 20, elevation: 3 },
  title: { fontSize: 42, fontWeight: "700", color: colors.text },
  subtitle: { marginTop: 6, fontSize: 21, color: colors.textMuted, lineHeight: 30 },
  field: { marginTop: 18 },
  label: { fontSize: 13, fontWeight: "700", letterSpacing: 1, color: "#2f3844" },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  reset: { fontSize: 12, fontWeight: "700", color: colors.primary },
  input: { marginTop: 8, backgroundColor: colors.surfaceLow, borderRadius: 8, borderBottomWidth: 2, borderBottomColor: "#dbe0e5", paddingHorizontal: 14, paddingVertical: 14, fontSize: 16, color: colors.text },
  error: { marginTop: 6, color: "#ba1a1a", fontSize: 12 },
  infoBox: { marginTop: 18, flexDirection: "row", gap: 8, alignItems: "center", backgroundColor: "#eaf5f7", borderRadius: 8, padding: 12 },
  infoText: { flex: 1, fontSize: 12, color: "#284c53", lineHeight: 17 },
  cta: { marginTop: 18, backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 16, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 10 },
  ctaText: { color: colors.onPrimary, fontSize: 18, fontWeight: "700" },
});
