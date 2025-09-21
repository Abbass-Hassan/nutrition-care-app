import 'dotenv/config';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import axios from 'axios';

const PORT = process.env.PORT || 4000;
const API_BASE = process.env.API_BASE || 'http://localhost:8000/api';

const app = express();
app.use(cors({ origin: '*'}));

const server = http.createServer(app);
const io = new Server(server, {
	cors: { origin: '*'}
});

// Simple in-memory mapping: userId -> socketIds
const userIdToSockets = new Map();

function addSocket(userId, socketId) {
	if (!userIdToSockets.has(userId)) userIdToSockets.set(userId, new Set());
	userIdToSockets.get(userId).add(socketId);
}

function removeSocket(userId, socketId) {
	const set = userIdToSockets.get(userId);
	if (!set) return;
	set.delete(socketId);
	if (set.size === 0) userIdToSockets.delete(userId);
}

async function verifyToken(token) {
	try {
		const res = await axios.get(`${API_BASE}/user`, {
			headers: { Authorization: `Bearer ${token}` }
		});
		return res.data; // { id, ... }
	} catch (e) {
		console.warn('verifyToken failed', e?.response?.status, e?.response?.data || e.message);
		return null;
	}
}

io.engine.on('connection_error', (err) => {
	console.warn('Engine connection_error', err?.code, err?.message);
});

io.use(async (socket, next) => {
	try {
		const token = socket.handshake?.auth?.token || socket.handshake?.query?.token || (socket.handshake?.headers?.authorization ? socket.handshake.headers.authorization.replace('Bearer ', '') : '');
		if (!token) {
			console.warn('Socket handshake missing token', socket.handshake?.auth, socket.handshake?.headers?.authorization);
			return next(new Error('Unauthorized'));
		}
		const data = await verifyToken(token);
		if (!data || !data.id) {
			console.warn('Socket token invalid');
			return next(new Error('Unauthorized'));
		}
		socket.user = data;
		socket.token = token;
		return next();
	} catch (e) {
		console.error('Handshake error', e);
		return next(new Error('Unauthorized'));
	}
});

io.on('connection', (socket) => {
	const user = socket.user;
	console.log('Socket connected', user?.id);
	addSocket(user.id, socket.id);

	socket.on('join-chat', async (chatId) => {
		if (!chatId) return;
		socket.join(`chat:${chatId}`);
	});

	socket.on('send-message', async ({ chatId, text }) => {
		if (!chatId || !text?.trim()) return;
		try {
			const res = await axios.post(`${API_BASE}/chats/${chatId}/messages`, { text }, {
				headers: { Authorization: `Bearer ${socket.token}` }
			});
			const message = res.data.message;
			io.to(`chat:${chatId}`).emit('new-message', message);
		} catch (e) {
			console.error('Failed to send message', e?.response?.status, e?.response?.data || e.message);
			socket.emit('error', { message: 'Failed to send message' });
		}
	});

	socket.on('disconnect', () => {
		removeSocket(user.id, socket.id);
	});
});

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

server.listen(PORT, () => {
	console.log(`Chat service running on :${PORT}`);
}); 