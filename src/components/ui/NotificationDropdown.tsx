import React, { useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Modal,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  type Notification,
} from "../../services/notificationService";
import { colors } from "../../theme/colors";

const TYPE_ICONS: Record<Notification["type"], string> = {
  job_approved: "checkmark-circle",
  system: "information-circle",
  alert: "warning",
  safety: "shield-checkmark",
};

const TYPE_COLORS: Record<Notification["type"], string> = {
  job_approved: colors.success,
  system: colors.primary,
  alert: colors.warning,
  safety: colors.danger,
};

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const diff = now - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function NotificationDropdown({ visible, onClose }: Props) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => fetchNotifications(1, 20),
    refetchInterval: 30_000,
    enabled: true,
  });

  const notifications = data?.notifications ?? [];
  const unreadCount = data?.unreadCount ?? 0;

  const handleMarkAsRead = useCallback(
    async (id: string) => {
      await markNotificationAsRead(id);
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    [queryClient]
  );

  const handleMarkAllAsRead = useCallback(async () => {
    await markAllNotificationsAsRead();
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
  }, [queryClient]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <View style={styles.dropdownAnchor}>
          <Pressable
            style={styles.dropdown}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Notifications</Text>
              {unreadCount > 0 && (
                <Pressable
                  onPress={handleMarkAllAsRead}
                  style={styles.markAllBtn}
                >
                  <Text style={styles.markAllText}>Mark all read</Text>
                </Pressable>
              )}
            </View>

            {/* Content */}
            {isLoading ? (
              <View style={styles.emptyState}>
                <ActivityIndicator color={colors.primary} />
              </View>
            ) : notifications.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons
                  name="notifications-off-outline"
                  size={32}
                  color={colors.outlineVariant}
                />
                <Text style={styles.emptyText}>No notifications yet</Text>
              </View>
            ) : (
              <ScrollView
                style={styles.list}
                showsVerticalScrollIndicator={false}
              >
                {notifications.map((notif, idx) => (
                  <Pressable
                    key={notif._id}
                    onPress={() => !notif.read && handleMarkAsRead(notif._id)}
                    style={[
                      styles.item,
                      !notif.read && styles.itemUnread,
                      idx < notifications.length - 1 && styles.itemBorder,
                    ]}
                  >
                    <View
                      style={[
                        styles.iconWrap,
                        { backgroundColor: TYPE_COLORS[notif.type] + "18" },
                      ]}
                    >
                      <Ionicons
                        name={TYPE_ICONS[notif.type] as any}
                        size={18}
                        color={TYPE_COLORS[notif.type]}
                      />
                    </View>
                    <View style={styles.itemContent}>
                      <Text
                        style={[
                          styles.itemTitle,
                          !notif.read && styles.itemTitleUnread,
                        ]}
                        numberOfLines={1}
                      >
                        {notif.title}
                      </Text>
                      <Text style={styles.itemBody} numberOfLines={2}>
                        {notif.body}
                      </Text>
                      <Text style={styles.itemTime}>
                        {timeAgo(notif.createdAt)}
                      </Text>
                    </View>
                    {!notif.read && <View style={styles.unreadDot} />}
                  </Pressable>
                ))}
              </ScrollView>
            )}
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}

// Standalone hook for unread count badge (used by the bell icon)
export function useUnreadCount() {
  const { data } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => fetchNotifications(1, 1),
    refetchInterval: 30_000,
    select: (d) => d.unreadCount,
  });
  return data ?? 0;
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  dropdownAnchor: {
    position: "absolute",
    top: 60,
    right: 12,
    left: 12,
  },
  dropdown: {
    backgroundColor: "rgba(255,255,255,0.94)",
    borderRadius: 16,
    maxHeight: 420,
    shadowColor: colors.onSurface,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 32,
    elevation: 12,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(193,199,209,0.15)",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.primary,
  },
  markAllBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: colors.secondaryContainer,
    borderRadius: 8,
  },
  markAllText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.onSecondaryFixedVariant,
  },
  list: {
    maxHeight: 360,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  itemUnread: {
    backgroundColor: "rgba(0,68,107,0.04)",
  },
  itemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(193,199,209,0.12)",
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.onSurface,
  },
  itemTitleUnread: {
    fontWeight: "800",
  },
  itemBody: {
    marginTop: 2,
    fontSize: 12,
    color: colors.onSurfaceVariant,
    lineHeight: 16,
  },
  itemTime: {
    marginTop: 4,
    fontSize: 10,
    color: colors.outlineVariant,
    fontWeight: "600",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    gap: 10,
  },
  emptyText: {
    fontSize: 13,
    color: colors.onSurfaceVariant,
  },
});
