import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { colors } from '../../theme';

const ChatTab = () => {
  const [messages, setMessages] = useState([
    { id: '1', from: 'dietitian', text: 'Hello! How are you feeling today?' },
    { id: '2', from: 'client', text: "I'm doing well, thanks!" },
  ]);
  const [draft, setDraft] = useState('');

  const handleSend = () => {
    const text = draft.trim();
    if (!text) return;
    setMessages(prev => [...prev, { id: String(Date.now()), from: 'client', text }]);
    setDraft('');
  };

  const renderItem = ({ item }) => (
    <View style={[styles.message, item.from === 'client' ? styles.outgoing : styles.incoming]}>
      <View style={[styles.bubble, item.from === 'client' ? styles.bubbleOutgoing : styles.bubbleIncoming]}>
        <Text style={item.from === 'client' ? styles.textOutgoing : styles.textIncoming}>{item.text}</Text>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <View style={styles.avatar}><Text style={styles.avatarText}>DT</Text></View>
        <View>
          <Text style={styles.name}>Your Dietitian</Text>
          <Text style={styles.username}>@dietitian</Text>
        </View>
      </View>

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.messages}
      />

      <View style={styles.composer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor={colors.textLight}
          value={draft}
          onChangeText={setDraft}
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