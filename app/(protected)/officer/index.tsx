import React, { useState, useCallback } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Image,
  Pressable,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { useQueryClient } from "@tanstack/react-query";

import { useAuthStore } from "../../../src/features/auth/store";
import { colors } from "../../../src/theme/colors";
import { useClock } from "../../../src/hooks/useClock";
import { useWeather } from "../../../src/hooks/useWeather";
import { uploadProfilePicture } from "../../../src/services/profileService";
import NotificationDropdown, {
  useUnreadCount,
} from "../../../src/components/ui/NotificationDropdown";

// ─── Static Data ────────────────────────────────────────────

const defaultPortrait =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDj5xOiLLLDSOQZry5XSL-_-3qO6Y3OwBBNWzTl_KxOJAqBTYEMfJe_NJeDlQ4ZJ0ljYOxuhkBysDnqPtgVrSLyX2H5LFHRgR4KAIFOsomJXCZFkQf06H1p94WUcFK94Qvrkq2ZX76ObezOEfB5tjY9DLGCyOZogpGOaIQQoCmjBAcwr4q_-rKU05g3jABMGOCWQOqeNP7q9dQfKuBPLTuF8ZemKKOuqLdvjnYFp4P2GEpoD11zHz7NF6x4gZyrACxNOq3PcelaXf0";

const headerPortrait =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBAKsrkTE4ZuseOP-tPPhrqNvrwRtrRcxc7OhnrCyJT9_3Bo5X0A-ww7ixNhKjqsxCwVTP9FQDAQBusWKoTL4EWESBMx-WNPvPd3pFiqg2IjLZH8Q-3lyFReRlUte1OHh8GMgGUMvsBR6s8LfG5cfiIh5_t5z7MM9FJxOdrIbPgZvG37w5afJiY0XHuz02xiAzNMHOH6SNgQihfydGSenSc39r-oJoS23SE86-Ek_aFt-cHrLBQVelnbo8crC9CaxKmsUJYs1iAG-s";

const approvedJobs = [
  {
    title: "Navigation System Calibration",
    time: "Today, 09:15 AM",
    tag: "Safety Critical",
    tagTone: "secondary" as const,
  },
  {
    title: "Engine Room Thermal Inspection",
    time: "Yesterday, 14:30 PM",
    tag: "Routine",
    tagTone: "primary" as const,
  },
  {
    title: "Bridge Resource Management Audit",
    time: "Oct 24, 08:00 AM",
    tag: "Compliance",
    tagTone: "tertiary" as const,
  },
];

const directReports = [
  {
    name: "Marcus Vane",
    role: "Second Officer",
    status: "On Duty",
    color: colors.success,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCfgj07q9xkj6xNlu0eypYZD2FWMntFgNwJXsdGlISGiy45WFodDQPV5I-05PnaC5zlSxSeibIjlz2M0F_2Ysx1JP8HYSahAs3fV7hr4YQQaWx6lRv-OtGIVtQddIaj-HTSw0G6QSikvWXs4NNVxVjmDQL8bOCCren0htla52en31fIp5F7sNWnpwUA_SL955C5zu_LnsA2gby2kKJfugNs8llldQtm0JcOpSn9YlVBu-LHCLUuVeRkn5X4KjdjWY2aI3K5UYp8_mI",
  },
  {
    name: "Elena Rossi",
    role: "Third Officer",
    status: "Off Duty",
    color: "#cbd5e1",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuApv2JaHKcIh7NLyHpY3yTtjMFFB_9jqk4ipdznrpGElnGt4Js0--If94xg2KHUSvhLwtColPGmEOTRkqqQEJqRPawQ_p2sbObKVoAqtxchk77L1mjDeevXqWTP_nQjrcICRsnTVdWGRHL3QOAbf0_fSYGL8qjhiFpOy4_Yaycv-H7zk-Rmkb0FYD2jPBEF1SazAJqb89N2A427CtjIXeZPVNuNpBj9bwuchAjKRxSbFJHFdJubRONFL-LznEDcL0y8jnWevZg_RRw",
  },
  {
    name: "David Kim",
    role: "Deck Cadet",
    status: "On Duty",
    color: colors.success,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBYUn8HXfOq6Dn8RYjK0U8HOPd5yXR1F87d9gn6evj72TWo8NBpqR0mo_wq6pITVzFuf3RdDF3B5j1DnRZjyRFz-oe0cbg4ChCgAzwQCM_Pvhthsa0a6qzcJ-tIiyA2g66Y8BUjY8TikvmP8KWjg8wR-RHC8IM4Pb5Eh1PIkpCWO6bA720TjFWf-D2DuZ6QOel2bA3En1NmvdKgFqYqMLnxbckpyrE0dpMjqb_XmBb7KXmn7gTltBTsGNt5WHaV6zFUYokPj0QPFJY",
  },
  {
    name: "Thomas Wright",
    role: "Bosun",
    status: "Standby",
    color: colors.warning,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA2ojvvXQgDGhlQ1_m_WoKwaqM7V6s0mv270uIGwI8gSffhCWXiR9GqoMnvkzq6evo4nxhlVfDzOYiU7xYf1ADvaE7setu_cD5gFiOZo-pzwsqfrROFnRDEC8kfEVhP2GDVOM9TB25dRjq3PsfYVrXYpkc3Am9RHoBh2v98aJKsrCShINHYSUhZcTzrLF-rzDldFCfImWtYNbJ2nl-sKBtXECjwghHo02Mssi49j_l3WCfKnHvZIVKgdn3SgvkjNjTk7pwQCORh0Y8",
  },
];

const metricCards = [
  { label: "Service Days", value: "2,480" },
  { label: "Safety Rating", value: "9.8" },
  { label: "Certificates", value: "14" },
  { label: "Status", value: "Active" },
];

// ─── Tag Component ──────────────────────────────────────────

function Tag({
  label,
  tone,
}: {
  label: string;
  tone: "secondary" | "primary" | "tertiary";
}) {
  const bg =
    tone === "secondary"
      ? colors.secondaryContainer
      : tone === "primary"
        ? colors.primaryFixed
        : colors.tertiaryFixed;

  const fg =
    tone === "secondary"
      ? colors.onSecondaryFixedVariant
      : tone === "primary"
        ? colors.primary
        : colors.tertiary;

  return (
    <View style={[styles.jobTag, { backgroundColor: bg }]}>
      <Text style={[styles.jobTagText, { color: fg }]}>{label}</Text>
    </View>
  );
}

// ─── Main Screen ────────────────────────────────────────────

export default function OfficerProfileScreen() {
  const user = useAuthStore((state) => state.user);
  const { setSession } = useAuthStore();
  const queryClient = useQueryClient();

  const clock = useClock();
  const { data: weather, isLoading: weatherLoading } = useWeather();

  const [notifOpen, setNotifOpen] = useState(false);
  const [uploadingPic, setUploadingPic] = useState(false);
  const unreadCount = useUnreadCount();

  const displayName = user?.name || "Capt. Sarah Miller";
  const displayRole =
    user?.role === "ADMIN"
      ? "Administrator"
      : user?.role === "HOD"
        ? "Head of Department"
        : "Chief Officer";

  const profileImage = user?.profilePicture || defaultPortrait;

  // ── Profile Picture Picker ──
  const handlePickImage = useCallback(async () => {
    Alert.alert("Update Profile Picture", "Choose a source", [
      {
        text: "Camera",
        onPress: () => pickImage("camera"),
      },
      {
        text: "Gallery",
        onPress: () => pickImage("gallery"),
      },
      { text: "Cancel", style: "cancel" },
    ]);
  }, []);

  const pickImage = async (source: "camera" | "gallery") => {
    try {
      const permissionResult =
        source === "camera"
          ? await ImagePicker.requestCameraPermissionsAsync()
          : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          "Permission required",
          `Please grant ${source} access to update your profile picture.`
        );
        return;
      }

      const result =
        source === "camera"
          ? await ImagePicker.launchCameraAsync({
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.8,
              base64: true,
            })
          : await ImagePicker.launchImageLibraryAsync({
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.8,
              base64: true,
              mediaTypes: ["images"],
            });

      if (result.canceled || !result.assets?.[0]?.base64) return;

      const asset = result.assets[0];
      const base64Image = `data:image/jpeg;base64,${asset.base64}`;

      setUploadingPic(true);

      // Optimistic update
      if (user) {
        setSession({ ...user, profilePicture: asset.uri });
      }

      const uploadResult = await uploadProfilePicture(base64Image);

      if (user) {
        setSession({ ...user, profilePicture: uploadResult.profilePicture });
      }

      Alert.alert("Success", "Profile picture updated!");
    } catch (error) {
      console.error("Upload error:", error);
      Alert.alert("Error", "Failed to upload profile picture. Try again.");
      // Revert optimistic update
      if (user) {
        setSession({ ...user, profilePicture: user.profilePicture });
      }
    } finally {
      setUploadingPic(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Top App Bar ── */}
        <View style={styles.topBar}>
          <View style={styles.brandRow}>
            <View style={styles.logoBadge}>
              <MaterialCommunityIcons
                name="anchor"
                size={15}
                color={colors.onPrimary}
              />
            </View>
            <Text style={styles.brandText}>
              The Nautical{"\n"}Horizon
            </Text>
          </View>

          <View style={styles.topActions}>
            <Pressable
              onPress={() => setNotifOpen(true)}
              style={styles.notifBtn}
            >
              <Ionicons
                name="notifications-outline"
                size={20}
                color={colors.primary}
              />
              {unreadCount > 0 && (
                <View style={styles.notifBadge}>
                  <Text style={styles.notifBadgeText}>
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </Text>
                </View>
              )}
            </Pressable>
            <View style={styles.headerAvatar}>
              <Image
                source={{ uri: profileImage }}
                style={styles.headerAvatarImage}
              />
            </View>
          </View>
        </View>

        {/* ── Hero Profile Card ── */}
        <View style={styles.heroCard}>
          <Pressable onPress={handlePickImage} style={styles.heroImageWrap}>
            <View style={styles.heroImageRing}>
              <Image
                source={{ uri: profileImage }}
                style={styles.heroImage}
              />
            </View>
            {uploadingPic && (
              <View style={styles.uploadOverlay}>
                <ActivityIndicator color={colors.onPrimary} size="small" />
              </View>
            )}
            <LinearGradient
              colors={[colors.primary, colors.primaryContainer]}
              style={styles.verifiedBadge}
            >
              <Ionicons name="checkmark" size={13} color={colors.onPrimary} />
            </LinearGradient>
          </Pressable>

          <Text style={styles.name}>{displayName}</Text>
          <Text style={styles.role}>{displayRole}</Text>

          {/* Info Chips */}
          <View style={styles.chipRow}>
            <View style={[styles.infoChip, styles.vesselChip]}>
              <MaterialCommunityIcons
                name="ferry"
                size={14}
                color={colors.onSecondaryFixedVariant}
              />
              <Text style={styles.chipTextSecondary}>M/V Atlantic Star</Text>
            </View>
            <View style={[styles.infoChip, styles.registryChip]}>
              <MaterialCommunityIcons
                name="compass-outline"
                size={14}
                color={colors.onTertiaryFixedVariant}
              />
              <Text style={styles.chipTextTertiary}>Registry: Panama</Text>
            </View>
          </View>

          {/* Metrics */}
          <View style={styles.metricGrid}>
            {metricCards.map((m) => (
              <View key={m.label} style={styles.metricItem}>
                <Text style={styles.metricLabel}>{m.label}</Text>
                <Text style={styles.metricValue}>{m.value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Current Watch / Telemetry Card ── */}
        <LinearGradient
          colors={[colors.primary, colors.primaryContainer]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.watchCard}
        >
          <View style={styles.watchInner}>
            <Text style={styles.watchLabel}>Current Watch</Text>

            <View style={styles.watchHeaderRow}>
              <Text style={styles.watchTime}>{clock.time}</Text>
              <Text style={styles.watchZone}>{clock.timezone}</Text>
            </View>

            <Text style={styles.watchSubtext}>
              Next Handover: {clock.nextHandover}
            </Text>

            <View style={styles.telemetrySection}>
              <View style={styles.telemetryRow}>
                <MaterialCommunityIcons
                  name="water-percent"
                  size={14}
                  color={colors.onPrimary}
                />
                <Text style={styles.telemetryText}>
                  Humidity:{" "}
                  {weatherLoading ? "..." : `${weather?.humidity ?? "--"}%`}
                </Text>
              </View>
              <View style={styles.telemetryRow}>
                <MaterialCommunityIcons
                  name="weather-windy"
                  size={14}
                  color={colors.onPrimary}
                />
                <Text style={styles.telemetryText}>
                  Wind:{" "}
                  {weatherLoading
                    ? "..."
                    : `${weather?.windSpeed ?? "--"} kts ${weather?.windDirection ?? ""}`}
                </Text>
              </View>
            </View>
          </View>

          {/* Decorative background icon */}
          <Ionicons
            name="time-outline"
            size={110}
            color="rgba(255,255,255,0.1)"
            style={styles.watchArtwork}
          />
        </LinearGradient>

        {/* ── Approved Jobs Section ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Approved Jobs</Text>
          <Pressable style={styles.linkRow}>
            <Text style={styles.linkText}>View Logs</Text>
            <Ionicons
              name="arrow-forward"
              size={13}
              color={colors.primaryContainer}
            />
          </Pressable>
        </View>

        <View style={styles.jobList}>
          {approvedJobs.map((job) => (
            <View key={job.title} style={styles.jobCard}>
              <View style={styles.jobCardHeader}>
                <View style={styles.jobCardCopy}>
                  <Text style={styles.jobTitle}>{job.title}</Text>
                  <View style={styles.jobTimeRow}>
                    <Ionicons
                      name="time-outline"
                      size={12}
                      color={colors.onSurfaceVariant}
                    />
                    <Text style={styles.jobTime}>{job.time}</Text>
                  </View>
                </View>
                <Tag label={job.tag} tone={job.tagTone} />
              </View>

              <View style={styles.jobFooter}>
                <View style={styles.signRow}>
                  <MaterialCommunityIcons
                    name="draw"
                    size={14}
                    color={colors.primary}
                  />
                  <Text style={styles.signature}>e-signed: S. Miller</Text>
                </View>
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={colors.primary}
                />
              </View>
            </View>
          ))}
        </View>

        {/* ── Direct Reports Section ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Direct Reports</Text>
          <View style={styles.totalPill}>
            <Text style={styles.totalPillText}>12 Total</Text>
          </View>
        </View>

        <View style={styles.crewCard}>
          {directReports.map((report, index) => (
            <View
              key={report.name}
              style={[
                styles.crewRow,
                index < directReports.length - 1 && styles.crewRowSeparator,
              ]}
            >
              <Image
                source={{ uri: report.image }}
                style={styles.crewAvatar}
              />
              <View style={styles.crewCopy}>
                <Text style={styles.crewName}>{report.name}</Text>
                <Text style={styles.crewRole}>{report.role}</Text>
              </View>
              <View style={styles.crewStatus}>
                <View
                  style={[styles.statusDot, { backgroundColor: report.color }]}
                />
                <Text style={styles.statusText}>{report.status}</Text>
              </View>
            </View>
          ))}

          <Pressable style={styles.crewAction}>
            <Text style={styles.crewActionText}>Manage Entire Crew</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* ── Notification Dropdown ── */}
      <NotificationDropdown
        visible={notifOpen}
        onClose={() => setNotifOpen(false)}
      />
    </SafeAreaView>
  );
}

// ─── Styles ─────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },

  // ── Top Bar ──
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logoBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  brandText: {
    fontSize: 16,
    lineHeight: 19,
    fontWeight: "800",
    color: colors.primary,
    letterSpacing: -0.3,
  },
  topActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  notifBtn: {
    padding: 6,
    borderRadius: 20,
    position: "relative",
  },
  notifBadge: {
    position: "absolute",
    top: 2,
    right: 2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.danger,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  notifBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    color: colors.onPrimary,
  },
  headerAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: colors.primaryContainer,
    backgroundColor: colors.surfaceLow,
  },
  headerAvatarImage: {
    width: "100%",
    height: "100%",
  },

  // ── Hero Profile Card ──
  heroCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 22,
    alignItems: "center",
    shadowColor: colors.onSurface,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.04,
    shadowRadius: 32,
    elevation: 3,
  },
  heroImageWrap: {
    position: "relative",
    marginBottom: 14,
  },
  heroImageRing: {
    width: 128,
    height: 128,
    borderRadius: 64,
    borderWidth: 4,
    borderColor: colors.primaryFixed,
    padding: 3,
    backgroundColor: colors.surface,
  },
  heroImage: {
    width: "100%",
    height: "100%",
    borderRadius: 60,
  },
  uploadOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 64,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  verifiedBadge: {
    position: "absolute",
    right: 2,
    bottom: 4,
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: colors.surface,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  name: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.primary,
    textAlign: "center",
    letterSpacing: -0.5,
  },
  role: {
    marginTop: 3,
    fontSize: 15,
    fontWeight: "500",
    color: colors.onSurfaceVariant,
    textAlign: "center",
  },

  // ── Info Chips ──
  chipRow: {
    marginTop: 14,
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  infoChip: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  vesselChip: {
    backgroundColor: colors.secondaryContainer,
  },
  registryChip: {
    backgroundColor: colors.tertiaryFixed,
  },
  chipTextSecondary: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.onSecondaryFixedVariant,
  },
  chipTextTertiary: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.onTertiaryFixedVariant,
  },

  // ── Metrics ──
  metricGrid: {
    marginTop: 20,
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  metricItem: {
    width: "48%",
    marginBottom: 12,
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    color: colors.onSurfaceVariant,
  },
  metricValue: {
    marginTop: 2,
    fontSize: 22,
    fontWeight: "800",
    color: colors.primary,
  },

  // ── Watch Card ──
  watchCard: {
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    overflow: "hidden",
  },
  watchInner: {
    zIndex: 1,
  },
  watchLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.onPrimary,
    marginBottom: 8,
  },
  watchHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  watchTime: {
    fontSize: 42,
    lineHeight: 44,
    fontWeight: "800",
    color: colors.onPrimary,
    letterSpacing: -2,
  },
  watchZone: {
    fontSize: 12,
    fontWeight: "700",
    color: "rgba(255,255,255,0.75)",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  watchSubtext: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: "600",
    color: "rgba(255,255,255,0.88)",
  },
  telemetrySection: {
    marginTop: 16,
    gap: 10,
  },
  telemetryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  telemetryText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.onPrimary,
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  watchArtwork: {
    position: "absolute",
    right: -8,
    bottom: -8,
  },

  // ── Section Header ──
  sectionHeader: {
    marginTop: 28,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.primary,
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  linkText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.primaryContainer,
  },

  // ── Job Cards ──
  jobList: {
    gap: 12,
  },
  jobCard: {
    backgroundColor: colors.surfaceLow,
    borderRadius: 16,
    padding: 16,
  },
  jobCardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  jobCardCopy: {
    flex: 1,
  },
  jobTitle: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "700",
    color: colors.onSurface,
  },
  jobTimeRow: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  jobTime: {
    fontSize: 12,
    color: colors.onSurfaceVariant,
  },
  jobTag: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  jobTagText: {
    fontSize: 9,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  jobFooter: {
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "rgba(193,199,209,0.2)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  signRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  signature: {
    fontSize: 12,
    fontStyle: "italic",
    color: colors.onSurfaceVariant,
  },

  // ── Direct Reports ──
  totalPill: {
    backgroundColor: colors.surfaceHigh,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  totalPillText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.onSurfaceVariant,
  },
  crewCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: colors.onSurface,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 12,
    elevation: 2,
  },
  crewRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  crewRowSeparator: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(193,199,209,0.1)",
  },
  crewAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  crewCopy: {
    flex: 1,
  },
  crewName: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.onSurface,
  },
  crewRole: {
    marginTop: 2,
    fontSize: 12,
    color: colors.onSurfaceVariant,
  },
  crewStatus: {
    alignItems: "flex-end",
    gap: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 9,
    fontWeight: "800",
    color: colors.onSurfaceVariant,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  crewAction: {
    backgroundColor: colors.surfaceHigh,
    alignItems: "center",
    paddingVertical: 16,
  },
  crewActionText: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.primary,
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
});
