import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, InteractionManager } from 'react-native';
import { colors } from '../../theme';
import { API_BASE, SOCKET_URL } from '../../config';
import { io } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ChatTab = () => {
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [chat, setChat] = useState(null);
  const [dietitian, setDietitian] = useState(null);
  const socketRef = useRef(null);
  const listRef = useRef(null);

  const scrollToBottom = (animated = true) => {
    const ref = listRef.current;
    if (!ref) return;
    InteractionManager.runAfterInteractions(() => {
      try {
        if (typeof ref.scrollToEnd === 'function') {
          ref.scrollToEnd({ animated });
        } else if (typeof ref.scrollToOffset === 'function') {
          ref.scrollToOffset({ offset: 100000, animated });
        } else if (messages.length > 0 && typeof ref.scrollToIndex === 'function') {
          ref.scrollToIndex({ index: messages.length - 1, animated });
        }
      } catch (e) {
        // Retry shortly if layout not ready
        setTimeout(() => {
          try { ref.scrollToEnd?.({ animated }); } catch {}
        }, 50);
      }
    });
  };

  useEffect(() => {
    const init = async () => {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      // Get or create my chat
      const chatRes = await fetch(`${API_BASE}/my-chat`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const chatData = await chatRes.json();
      if (chatRes.ok && chatData.success) {
        setChat(chatData.chat);
        // Use dietitian details from API if present
        if (chatData.chat?.dietitian) {
          setDietitian({ id: chatData.chat.dietitian.id, name: chatData.chat.dietitian.name, username: chatData.chat.dietitian.username || 'dietitian' });
        }
      }

      // Fetch messages
      if (chatData?.chat?.id) {
        const msgRes = await fetch(`${API_BASE}/chats/${chatData.chat.id}/messages`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const msgData = await msgRes.json();
        if (msgRes.ok && msgData.success) {
          setMessages(msgData.messages || []);
          setTimeout(() => scrollToBottom(false), 80);
        }
      }

      // Fallback dietitian from stored user if API didn’t include
      if (!dietitian) {
        const userStr = await AsyncStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : null;
        if (user?.dietitian_id) {
          setDietitian({ id: user.dietitian_id, name: 'Your Dietitian', username: 'dietitian' });
        }
      }

      // Connect socket and join
      if (!socketRef.current) {
        socketRef.current = io(SOCKET_URL, { auth: { token } });
        socketRef.current.on('new-message', (message) => {
          if (message.chat_id === chatData.chat.id) {
            setMessages(prev => [...prev, message]);
            setTimeout(() => scrollToBottom(true), 10);
          }
        });
      }
      if (chatData?.chat?.id) {
        socketRef.current.emit('join-chat', chatData.chat.id);
      }
    };
    init();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => scrollToBottom(true), 10);
    }
  }, [messages]);

  const handleSend = async () => {
    const text = draft.trim();
    if (!text || !chat) return;
    socketRef.current?.emit('send-message', { chatId: chat.id, text });
    setDraft('');
    setTimeout(() => scrollToBottom(true), 10);
  };

  const renderItem = ({ item }) => (
    <View style={[styles.message, item.sender_id === dietitian?.id ? styles.incoming : styles.outgoing]}>
      <View style={[styles.bubble, item.sender_id === dietitian?.id ? styles.bubbleIncoming : styles.bubbleOutgoing]}>
        <Text style={item.sender_id === dietitian?.id ? styles.textIncoming : styles.textOutgoing}>{item.text}</Text>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}>
      <View style={styles.header}>
        <View style={styles.avatar}><Text style={styles.avatarText}>DT</Text></View>
        <View>
          <Text style={styles.name}>{dietitian?.name || 'Your Dietitian'}</Text>
          <Text style={styles.username}>@{dietitian?.username || 'dietitian'}</Text>
        </View>
      </View>

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={[styles.messages, { paddingBottom: 24 }]}
        style={{ flex: 1 }}
        onContentSizeChange={() => scrollToBottom(false)}
        onLayout={() => scrollToBottom(false)}
        keyboardShouldPersistTaps="handled"
      />

      <View style={styles.composer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor={colors.textLight}
          value={draft}
          onChangeText={setDraft}
          onSubmitEditing={handleSend}
          returnKeyType="send"
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend} disabled={!draft.trim()}>
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundLight },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.backgroundLight,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: { color: 'white', fontWeight: '800' },
  name: { fontSize: 16, fontWeight: '800', color: colors.text },
  username: { fontSize: 13, color: colors.textSecondary },

  messages: { padding: 12 },
  message: { marginVertical: 4, flexDirection: 'row' },
  incoming: { justifyContent: 'flex-start' },
  outgoing: { justifyContent: 'flex-end' },
  bubble: { maxWidth: '75%', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 14 },
  bubbleIncoming: { backgroundColor: '#edf2f7' },
  bubbleOutgoing: { backgroundColor: colors.primary },
  textIncoming: { color: '#1a202c', fontSize: 15 },
  textOutgoing: { color: 'white', fontSize: 15 },

  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.backgroundLight,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 12,
    marginRight: 8,
    backgroundColor: colors.backgroundLight,
    color: colors.text,
  },
  sendButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  sendText: { color: 'white', fontWeight: '700' },
});

export default ChatTab; 