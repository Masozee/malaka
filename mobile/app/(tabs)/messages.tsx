import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
  Search01Icon,
  UserGroupIcon,
  PencilEdit01Icon,
  Cancel01Icon,
} from '@hugeicons/core-free-icons';
import { useTheme } from '@/hooks/useTheme';
import { Avatar } from '@/components/ui/Avatar';
import { CountBadge } from '@/components/ui/Badge';
import { Spacing, Typography, BorderRadius } from '@/constants/theme';
import { messagingApi } from '@/services/api';
import { useAppStore } from '@/stores/appStore';

interface ConversationItem {
  id: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  online: boolean;
  isGroup: boolean;
}

export default function MessagesScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [showUserPicker, setShowUserPicker] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [creatingConvo, setCreatingConvo] = useState(false);
  const fetchCounts = useAppStore((s) => s.fetchCounts);

  const loadConversations = useCallback(async () => {
    try {
      const res = await messagingApi.getConversations();
      const rawList = res.data?.data ?? res.data ?? [];
      const list = Array.isArray(rawList) ? rawList : [];

      const mapped: ConversationItem[] = list.map((c: any) => ({
        id: c.id,
        name: c.name || c.display_name || c.other_user?.full_name || c.other_user?.username || 'Unknown',
        avatar: c.avatar || c.other_user?.avatar,
        lastMessage: c.last_message?.encrypted_content || c.last_message?.content || c.last_message_content || '',
        timestamp: c.last_message?.created_at || c.updated_at || '',
        unreadCount: c.unread_count ?? 0,
        online: c.other_user?.is_online ?? false,
        isGroup: c.is_group ?? false,
      }));

      setConversations(mapped);
    } catch {
      setConversations([]);
    }
  }, []);

  useEffect(() => {
    loadConversations().finally(() => setLoading(false));
  }, [loadConversations]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadConversations();
    await fetchCounts();
    setRefreshing(false);
  }, [loadConversations, fetchCounts]);

  const filteredConversations = searchQuery
    ? conversations.filter((c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : conversations;

  // Load company users when modal opens
  useEffect(() => {
    if (!showUserPicker) return;
    setLoadingUsers(true);
    messagingApi
      .getCompanyUsers()
      .then((res) => {
        const raw = res.data?.data ?? res.data ?? [];
        setAllUsers(Array.isArray(raw) ? raw : []);
      })
      .catch(() => setAllUsers([]))
      .finally(() => setLoadingUsers(false));
  }, [showUserPicker]);

  const filteredUsers = userSearch
    ? allUsers.filter(
        (u: any) =>
          (u.full_name || '').toLowerCase().includes(userSearch.toLowerCase()) ||
          (u.username || '').toLowerCase().includes(userSearch.toLowerCase()) ||
          (u.email || '').toLowerCase().includes(userSearch.toLowerCase())
      )
    : allUsers;

  const handleStartConversation = useCallback(
    async (userId: string) => {
      if (creatingConvo) return;
      setCreatingConvo(true);
      try {
        const res = await messagingApi.getOrCreateConversation(userId);
        const convo = res.data?.data ?? res.data;
        if (convo?.id) {
          setShowUserPicker(false);
          setUserSearch('');
          router.push(`/chat/${convo.id}`);
          // Refresh conversation list
          loadConversations();
        }
      } catch {
        // Silently fail
      } finally {
        setCreatingConvo(false);
      }
    },
    [creatingConvo, router, loadConversations]
  );

  const formatTimestamp = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours < 1) return 'Just now';
      if (diffHours < 24) {
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
      }
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return date.toLocaleDateString('en-US', { weekday: 'short' });
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.appBackground }}>
      {/* Header */}
      <View
        style={{
          paddingHorizontal: Spacing.lg,
          paddingVertical: Spacing.md,
          backgroundColor: colors.card,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <Text style={{ ...Typography.h2, color: colors.foreground }}>
          Messages
        </Text>
      </View>

      {/* Search */}
      <View style={{ paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.surface,
            borderRadius: BorderRadius.md,
            paddingHorizontal: Spacing.md,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <HugeiconsIcon icon={Search01Icon} size={18} color={colors.tertiaryText} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search conversations..."
            placeholderTextColor={colors.tertiaryText}
            style={{
              flex: 1,
              paddingVertical: Spacing.sm,
              marginLeft: 8,
              ...Typography.body,
              color: colors.foreground,
            }}
          />
        </View>
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <>
          {/* Conversation List */}
          <ScrollView
            style={{ flex: 1 }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={colors.primary}
              />
            }
          >
            {filteredConversations.length === 0 ? (
              <View style={{ padding: Spacing.xxxl, alignItems: 'center' }}>
                <Text style={{ ...Typography.body, color: colors.tertiaryText }}>
                  {searchQuery ? 'No conversations found' : 'No conversations yet'}
                </Text>
              </View>
            ) : (
              filteredConversations.map((conversation) => (
                <TouchableOpacity
                  key={conversation.id}
                  onPress={() => router.push(`/chat/${conversation.id}`)}
                  activeOpacity={0.7}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: Spacing.lg,
                    paddingVertical: Spacing.md,
                    gap: Spacing.md,
                    backgroundColor: conversation.unreadCount > 0 ? `${colors.primary}05` : 'transparent',
                    borderBottomWidth: 1,
                    borderBottomColor: colors.borderLight,
                  }}
                >
                  <Avatar
                    name={conversation.name}
                    size={48}
                    online={conversation.online}
                  />
                  <View style={{ flex: 1, gap: 2 }}>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1 }}>
                        {conversation.isGroup && (
                          <HugeiconsIcon icon={UserGroupIcon} size={14} color={colors.secondaryText} />
                        )}
                        <Text
                          style={{
                            ...Typography.bodyMedium,
                            color: colors.foreground,
                            fontFamily:
                              conversation.unreadCount > 0
                                ? 'NotoSans_700Bold'
                                : 'NotoSans_500Medium',
                          }}
                          numberOfLines={1}
                        >
                          {conversation.name}
                        </Text>
                      </View>
                      <Text
                        style={{
                          ...Typography.caption,
                          color:
                            conversation.unreadCount > 0
                              ? colors.primary
                              : colors.tertiaryText,
                        }}
                      >
                        {formatTimestamp(conversation.timestamp)}
                      </Text>
                    </View>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Text
                        style={{
                          ...Typography.caption,
                          color: colors.secondaryText,
                          flex: 1,
                        }}
                        numberOfLines={1}
                      >
                        {conversation.lastMessage}
                      </Text>
                      {conversation.unreadCount > 0 && (
                        <CountBadge count={conversation.unreadCount} />
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>

          {/* FAB - Compose */}
          <TouchableOpacity
            onPress={() => setShowUserPicker(true)}
            style={{
              position: 'absolute',
              bottom: 24,
              right: 24,
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: colors.primary,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <HugeiconsIcon icon={PencilEdit01Icon} size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </>
      )}

      {/* User Picker Modal */}
      <Modal visible={showUserPicker} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.appBackground }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: Spacing.lg,
              paddingVertical: Spacing.md,
              backgroundColor: colors.card,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
              gap: Spacing.md,
            }}
          >
            <TouchableOpacity onPress={() => setShowUserPicker(false)}>
              <HugeiconsIcon icon={Cancel01Icon} size={24} color={colors.foreground} />
            </TouchableOpacity>
            <Text style={{ ...Typography.h3, color: colors.foreground, flex: 1 }}>
              New Conversation
            </Text>
          </View>

          {/* User Search */}
          <View style={{ paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: colors.surface,
                borderRadius: BorderRadius.md,
                paddingHorizontal: Spacing.md,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <HugeiconsIcon icon={Search01Icon} size={18} color={colors.tertiaryText} />
              <TextInput
                value={userSearch}
                onChangeText={setUserSearch}
                placeholder="Search users..."
                placeholderTextColor={colors.tertiaryText}
                style={{
                  flex: 1,
                  paddingVertical: Spacing.sm,
                  marginLeft: 8,
                  ...Typography.body,
                  color: colors.foreground,
                }}
              />
            </View>
          </View>

          {loadingUsers ? (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : (
            <FlatList
              data={filteredUsers}
              keyExtractor={(item) => item.user_id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handleStartConversation(item.user_id)}
                  disabled={creatingConvo}
                  activeOpacity={0.7}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: Spacing.lg,
                    paddingVertical: Spacing.md,
                    gap: Spacing.md,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.borderLight,
                  }}
                >
                  <Avatar name={item.full_name || item.username} size={44} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ ...Typography.bodyMedium, color: colors.foreground }}>
                      {item.full_name || item.username}
                    </Text>
                    <Text style={{ ...Typography.caption, color: colors.secondaryText }}>
                      {item.role || item.email}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={{ padding: Spacing.xxxl, alignItems: 'center' }}>
                  <Text style={{ ...Typography.body, color: colors.tertiaryText }}>
                    No users found
                  </Text>
                </View>
              }
            />
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
