import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
  ArrowLeft01Icon,
  Attachment01Icon,
  SentIcon,
} from '@hugeicons/core-free-icons';
import { useTheme } from '@/hooks/useTheme';
import { Avatar } from '@/components/ui/Avatar';
import { Spacing, Typography, BorderRadius } from '@/constants/theme';
import { messagingApi } from '@/services/api';
import { useAuthStore } from '@/stores/authStore';
import { useChatSocket } from '@/hooks/useChatSocket';

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  createdAt: string;
  isDeleted: boolean;
  attachments: any[];
}

interface ConversationInfo {
  id: string;
  name: string;
  isGroup: boolean;
  otherUserId?: string;
}

export default function ChatScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversation, setConversation] = useState<ConversationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const currentUser = useAuthStore((s) => s.user);
  const currentUserId = currentUser?.id ?? '';

  // Map raw API message to our ChatMessage
  const mapMessage = useCallback((msg: any): ChatMessage => ({
    id: msg.id,
    senderId: msg.sender_id,
    senderName: msg.sender_username || '',
    text: msg.encrypted_content || msg.content || '',
    timestamp: formatTime(msg.created_at),
    createdAt: msg.created_at,
    isDeleted: !!msg.deleted_at,
    attachments: msg.attachments || [],
  }), []);

  // Load conversation info
  const loadConversation = useCallback(async () => {
    if (!id) return;
    try {
      const res = await messagingApi.getConversation(id);
      const c = res.data?.data ?? res.data;
      if (c) {
        setConversation({
          id: c.id,
          name: c.is_group
            ? c.name
            : c.other_user?.full_name || c.other_user?.username || 'Unknown',
          isGroup: c.is_group ?? false,
          otherUserId: c.other_user?.user_id,
        });
      }
    } catch {
      // fallback
    }
  }, [id]);

  // Load messages
  const loadMessages = useCallback(async (offset = 0) => {
    if (!id) return;
    try {
      const res = await messagingApi.getMessages(id, { limit: 50, offset });
      const raw = res.data?.data ?? res.data ?? [];
      const list = Array.isArray(raw) ? raw : [];
      const mapped = list.map(mapMessage);

      if (offset === 0) {
        // Reverse so oldest first (API returns newest first)
        setMessages(mapped.reverse());
      } else {
        // Prepend older messages
        setMessages((prev) => [...mapped.reverse(), ...prev]);
      }
      setHasMore(list.length >= 50);
    } catch {
      if (offset === 0) setMessages([]);
    }
  }, [id, mapMessage]);

  useEffect(() => {
    Promise.all([loadConversation(), loadMessages()]).finally(() =>
      setLoading(false)
    );
    // Mark as read
    if (id) messagingApi.markConversationRead(id).catch(() => {});
  }, [id, loadConversation, loadMessages]);

  // WebSocket for real-time messages
  const { sendTyping } = useChatSocket({
    enabled: !!id,
    onChatMessage: useCallback(
      (payload: any) => {
        if (payload.conversation_id !== id) return;
        const mapped = mapMessage(payload);
        setMessages((prev) => {
          // Deduplicate
          if (prev.some((m) => m.id === mapped.id)) return prev;
          return [...prev, mapped];
        });
        // Auto-scroll to bottom
        setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
        // Mark as read if from someone else
        if (payload.sender_id !== currentUserId && id) {
          messagingApi.markConversationRead(id).catch(() => {});
        }
      },
      [id, currentUserId, mapMessage]
    ),
    onTypingIndicator: useCallback(
      (payload: any) => {
        if (payload.conversation_id !== id) return;
        if (payload.user_id === currentUserId) return;
        if (payload.is_typing) {
          setTypingUser(payload.user_id);
          // Clear after 3s
          if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
          typingTimerRef.current = setTimeout(() => setTypingUser(null), 3000);
        } else {
          setTypingUser(null);
        }
      },
      [id, currentUserId]
    ),
  });

  // Send message
  const handleSend = async () => {
    const text = newMessage.trim();
    if (!text || !id || sending) return;

    // Optimistically add message
    const tempId = `temp-${Date.now()}`;
    const optimistic: ChatMessage = {
      id: tempId,
      senderId: currentUserId,
      senderName: currentUser?.email || '',
      text,
      timestamp: formatTime(new Date().toISOString()),
      createdAt: new Date().toISOString(),
      isDeleted: false,
      attachments: [],
    };
    setMessages((prev) => [...prev, optimistic]);
    setNewMessage('');
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);

    setSending(true);
    try {
      const res = await messagingApi.sendMessage(id, text);
      const real = res.data?.data ?? res.data;
      if (real?.id) {
        // Replace temp message with real one
        setMessages((prev) =>
          prev.map((m) => (m.id === tempId ? mapMessage(real) : m))
        );
      }
    } catch {
      // Remove optimistic message on failure
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setNewMessage(text); // Restore text
    } finally {
      setSending(false);
    }
  };

  // Load older messages
  const handleLoadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    await loadMessages(messages.length);
    setLoadingMore(false);
  };

  // Typing indicator
  const handleTextChange = (text: string) => {
    setNewMessage(text);
    if (id && text.length > 0) {
      sendTyping(id, true);
    }
  };

  const renderMessage = (msg: ChatMessage, index: number) => {
    const isMine = msg.senderId === currentUserId;
    const nextMsg = messages[index + 1];
    const showTimestamp = !nextMsg || nextMsg.senderId !== msg.senderId;

    if (msg.isDeleted) {
      return (
        <View
          key={msg.id}
          style={{
            alignSelf: isMine ? 'flex-end' : 'flex-start',
            maxWidth: '80%',
            marginBottom: Spacing.xs,
          }}
        >
          <View
            style={{
              backgroundColor: colors.muted,
              borderRadius: BorderRadius.lg,
              paddingHorizontal: Spacing.md,
              paddingVertical: Spacing.sm,
            }}
          >
            <Text style={{ ...Typography.caption, color: colors.tertiaryText, fontStyle: 'italic' }}>
              Message deleted
            </Text>
          </View>
        </View>
      );
    }

    return (
      <View
        key={msg.id}
        style={{
          alignSelf: isMine ? 'flex-end' : 'flex-start',
          maxWidth: '80%',
          marginBottom: showTimestamp ? Spacing.md : Spacing.xs,
        }}
      >
        <View
          style={{
            backgroundColor: isMine ? colors.primary : colors.surface,
            borderRadius: BorderRadius.lg,
            borderTopRightRadius: isMine ? 4 : BorderRadius.lg,
            borderTopLeftRadius: isMine ? BorderRadius.lg : 4,
            paddingHorizontal: Spacing.md,
            paddingVertical: Spacing.sm,
            borderWidth: isMine ? 0 : 1,
            borderColor: colors.border,
          }}
        >
          <Text
            style={{
              ...Typography.body,
              color: isMine ? '#FFFFFF' : colors.foreground,
            }}
          >
            {msg.text}
          </Text>
        </View>
        {showTimestamp && (
          <Text
            style={{
              ...Typography.caption,
              color: colors.tertiaryText,
              marginTop: 2,
              textAlign: isMine ? 'right' : 'left',
              fontSize: 11,
            }}
          >
            {msg.timestamp}
          </Text>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.appBackground }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.appBackground }}>
      {/* Header */}
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
        <TouchableOpacity onPress={() => router.back()}>
          <HugeiconsIcon icon={ArrowLeft01Icon} size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Avatar name={conversation?.name || 'Chat'} size={36} />
        <View style={{ flex: 1 }}>
          <Text style={{ ...Typography.bodyMedium, color: colors.foreground }} numberOfLines={1}>
            {conversation?.name || 'Chat'}
          </Text>
          {typingUser ? (
            <Text style={{ ...Typography.caption, color: colors.primary, fontSize: 11 }}>
              typing...
            </Text>
          ) : null}
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={0}
      >
        {/* Messages */}
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={{
            padding: Spacing.lg,
            gap: Spacing.xs,
          }}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
        >
          {/* Load more button */}
          {hasMore && (
            <TouchableOpacity
              onPress={handleLoadMore}
              style={{ alignItems: 'center', paddingVertical: Spacing.sm }}
            >
              {loadingMore ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Text style={{ ...Typography.caption, color: colors.primary }}>
                  Load earlier messages
                </Text>
              )}
            </TouchableOpacity>
          )}

          {messages.length === 0 ? (
            <View style={{ padding: Spacing.xxxl, alignItems: 'center' }}>
              <Text style={{ ...Typography.body, color: colors.tertiaryText }}>
                No messages yet. Say hello!
              </Text>
            </View>
          ) : (
            messages.map((msg, index) => renderMessage(msg, index))
          )}

          {/* Typing Indicator */}
          {typingUser && (
            <View
              style={{
                alignSelf: 'flex-start',
                backgroundColor: colors.surface,
                borderRadius: BorderRadius.lg,
                borderTopLeftRadius: 4,
                paddingHorizontal: Spacing.md,
                paddingVertical: Spacing.sm,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text style={{ ...Typography.caption, color: colors.secondaryText }}>
                typing...
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Input Bar */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-end',
            paddingHorizontal: Spacing.md,
            paddingVertical: Spacing.sm,
            paddingBottom: Spacing.md,
            backgroundColor: colors.card,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            gap: Spacing.sm,
          }}
        >
          <TouchableOpacity
            style={{
              width: 40,
              height: 40,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <HugeiconsIcon icon={Attachment01Icon} size={22} color={colors.secondaryText} />
          </TouchableOpacity>

          <TextInput
            value={newMessage}
            onChangeText={handleTextChange}
            placeholder="Type a message..."
            placeholderTextColor={colors.tertiaryText}
            multiline
            style={{
              flex: 1,
              backgroundColor: colors.surface,
              borderRadius: BorderRadius.xl,
              borderWidth: 1,
              borderColor: colors.border,
              paddingHorizontal: Spacing.lg,
              paddingVertical: Spacing.sm,
              ...Typography.body,
              color: colors.foreground,
              maxHeight: 100,
            }}
          />

          <TouchableOpacity
            onPress={handleSend}
            disabled={!newMessage.trim() || sending}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: newMessage.trim() ? colors.primary : colors.muted,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: sending ? 0.6 : 1,
            }}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <HugeiconsIcon
                icon={SentIcon}
                size={18}
                color={newMessage.trim() ? '#FFFFFF' : colors.tertiaryText}
              />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function formatTime(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours < 24) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    }
    if (diffHours < 48) {
      return 'Yesterday ' + date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
      ' ' + date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  } catch {
    return '';
  }
}
