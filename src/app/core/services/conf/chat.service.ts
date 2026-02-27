// src/app/core/services/conf/chat.service.ts
import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { ChatUserMock, ChatRoomMock, ChatMessageMock, ChatRole, ChatRoomType, MOCK_CHAT_USERS, MOCK_CHAT_ROOMS, MOCK_CHAT_MESSAGES } from '../../../shared/data/chat.mock';

export interface SessionUser {
    username: string;
    name: string;
    role: ChatRole;
}

@Injectable({ providedIn: 'root' })
export class ChatService {
    private _rooms = signal<ChatRoomMock[]>([...MOCK_CHAT_ROOMS]);
    private _messages = signal<ChatMessageMock[]>([...MOCK_CHAT_MESSAGES]);
    private _activeRoom = signal<ChatRoomMock | null>(null);

    rooms = this._rooms.asReadonly();
    activeRoom = this._activeRoom.asReadonly();

    // ── Sesión ────────────────────────────────────────────────────────────────

    private get currentUser(): SessionUser | null {
        const raw = sessionStorage.getItem('currentUser');
        return raw ? JSON.parse(raw) : null;
    }

    get currentChatUser(): ChatUserMock | null {
        const s = this.currentUser;
        return s ? (MOCK_CHAT_USERS.find((u) => u.username === s.username) ?? null) : null;
    }

    get isAdmin(): boolean {
        return this.currentUser?.role === 'ADMIN';
    }

    // ── Salas visibles por rol ────────────────────────────────────────────────
    // ADMIN: todas
    // Otros: GENERAL + su ROLE + sus PRIVATE/GROUP como miembro

    getVisibleRooms(): Observable<ChatRoomMock[]> {
        const session = this.currentUser;
        if (!session) return of([]);

        const user = this.currentChatUser;
        const isAdmin = session.role === 'ADMIN';

        const rooms = this._rooms().filter((r) => {
            if (!r.isActive) return false;
            if (isAdmin) return true;
            switch (r.type) {
                case 'GENERAL':
                    return true;
                case 'ROLE':
                    return r.allowedRole === session.role;
                case 'PRIVATE':
                case 'GROUP':
                    return r.members?.includes(user?.idUser ?? -1) ?? false;
                default:
                    return false;
            }
        });

        const enriched = rooms.map((room) => ({
            ...room,
            lastMessage: this.getLastMessage(room.idRoom),
            unreadCount: this.getUnreadCount(room.idRoom)
        }));

        // Orden: GENERAL → ROLE → GROUP → PRIVATE, cada sección por actividad reciente
        const typeOrder: Record<ChatRoomType, number> = { GENERAL: 0, ROLE: 1, GROUP: 2, PRIVATE: 3 };
        enriched.sort((a, b) => {
            if (typeOrder[a.type] !== typeOrder[b.type]) return typeOrder[a.type] - typeOrder[b.type];
            const aT = a.lastMessage?.sentAt ?? a.createdAt;
            const bT = b.lastMessage?.sentAt ?? b.createdAt;
            return bT.localeCompare(aT);
        });

        return of(enriched).pipe(delay(150));
    }

    getAdminRoomStats(): Observable<{
        totalRooms: number;
        activeUsers: number;
        totalMessages: number;
        roomStats: { room: ChatRoomMock; msgCount: number; lastActivity: string }[];
    }> {
        const msgs = this._messages();
        const rooms = this._rooms().filter((r) => r.isActive);
        const roomStats = rooms
            .map((room) => ({
                room,
                msgCount: msgs.filter((m) => m.idRoom === room.idRoom && !m.isDeleted).length,
                lastActivity: this.getLastMessage(room.idRoom)?.sentAt ?? room.createdAt
            }))
            .sort((a, b) => b.lastActivity.localeCompare(a.lastActivity));

        return of({
            totalRooms: rooms.length,
            activeUsers: MOCK_CHAT_USERS.filter((u) => u.isOnline).length,
            totalMessages: msgs.filter((m) => !m.isDeleted).length,
            roomStats
        }).pipe(delay(200));
    }

    // ── Mensajes ──────────────────────────────────────────────────────────────

    getMessages(idRoom: number): Observable<ChatMessageMock[]> {
        return of(
            this._messages()
                .filter((m) => m.idRoom === idRoom && !m.isDeleted)
                .sort((a, b) => a.sentAt.localeCompare(b.sentAt))
        ).pipe(delay(100));
    }

    sendMessage(idRoom: number, content: string, replyToId?: number): Observable<ChatMessageMock> {
        const user = this.currentChatUser;
        if (!user) return of({} as ChatMessageMock);

        const replyMsg = replyToId ? this._messages().find((m) => m.idMessage === replyToId) : undefined;

        const newMsg: ChatMessageMock = {
            idMessage: Math.max(0, ...this._messages().map((m) => m.idMessage)) + 1,
            idRoom,
            idSender: user.idUser,
            senderName: user.fullName,
            senderInitials: user.initials,
            senderColor: user.avatarColor,
            senderRole: user.role,
            content: content.trim(),
            sentAt: new Date().toISOString(),
            status: 'SENT',
            isDeleted: false,
            replyTo: replyToId,
            replyPreview: replyMsg ? replyMsg.content.slice(0, 60) : undefined
        };

        this._messages.update((msgs) => [...msgs, newMsg]);
        this._rooms.update((r) => [...r]);
        return of(newMsg).pipe(delay(80));
    }

    deleteMessage(idMessage: number): Observable<boolean> {
        this._messages.update((msgs) => msgs.map((m) => (m.idMessage === idMessage ? { ...m, isDeleted: true } : m)));
        return of(true).pipe(delay(100));
    }

    setActiveRoom(room: ChatRoomMock | null): void {
        this._activeRoom.set(room);
        if (room) {
            this._messages.update((msgs) => msgs.map((m) => (m.idRoom === room.idRoom && m.status !== 'READ' ? { ...m, status: 'READ' } : m)));
        }
    }

    // ── Crear sala privada (2 personas) ───────────────────────────────────────

    createPrivateRoom(targetUserId: number): Observable<ChatRoomMock> {
        const user = this.currentChatUser;
        if (!user) return of({} as ChatRoomMock);

        const existing = this._rooms().find((r) => r.type === 'PRIVATE' && r.members?.includes(user.idUser) && r.members?.includes(targetUserId));
        if (existing) return of(existing);

        const newRoom: ChatRoomMock = {
            idRoom: Math.max(0, ...this._rooms().map((r) => r.idRoom)) + 1,
            idCompany: 1,
            name: 'Privado',
            type: 'PRIVATE',
            members: [user.idUser, targetUserId],
            createdBy: user.idUser,
            createdAt: new Date().toISOString(),
            isActive: true
        };
        this._rooms.update((rooms) => [...rooms, newRoom]);
        return of(newRoom).pipe(delay(100));
    }

    // ── Crear sala grupal (3+ personas) ───────────────────────────────────────

    createGroupRoom(name: string, memberIds: number[], emoji: string = '👥'): Observable<ChatRoomMock> {
        const user = this.currentChatUser;
        if (!user) return of({} as ChatRoomMock);

        // Incluir al creador si no está
        const allMembers = memberIds.includes(user.idUser) ? memberIds : [user.idUser, ...memberIds];

        const newRoom: ChatRoomMock = {
            idRoom: Math.max(0, ...this._rooms().map((r) => r.idRoom)) + 1,
            idCompany: 1,
            name: name.trim(),
            type: 'GROUP',
            members: allMembers,
            groupAvatar: emoji,
            createdBy: user.idUser,
            createdAt: new Date().toISOString(),
            isActive: true
        };
        this._rooms.update((rooms) => [...rooms, newRoom]);
        return of(newRoom).pipe(delay(120));
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    getRoomDisplayName(room: ChatRoomMock): string {
        if (room.type === 'GENERAL' || room.type === 'ROLE') return room.name;
        if (room.type === 'GROUP') return room.name;
        // PRIVATE: nombre del otro participante
        const user = this.currentChatUser;
        const otherId = room.members?.find((id) => id !== user?.idUser);
        return MOCK_CHAT_USERS.find((u) => u.idUser === otherId)?.fullName ?? 'Chat privado';
    }

    getRoomOtherUser(room: ChatRoomMock): ChatUserMock | null {
        if (room.type !== 'PRIVATE') return null;
        const user = this.currentChatUser;
        const otherId = room.members?.find((id) => id !== user?.idUser);
        return MOCK_CHAT_USERS.find((u) => u.idUser === otherId) ?? null;
    }

    getGroupMembers(room: ChatRoomMock): ChatUserMock[] {
        if (!room.members) return [];
        return room.members.map((id) => MOCK_CHAT_USERS.find((u) => u.idUser === id)).filter((u): u is ChatUserMock => !!u);
    }

    // Todos los usuarios menos el actual (para crear salas)
    getAllUsers(): ChatUserMock[] {
        return MOCK_CHAT_USERS.filter((u) => u.idUser !== this.currentChatUser?.idUser);
    }

    private getLastMessage(idRoom: number): ChatMessageMock | undefined {
        return this._messages()
            .filter((m) => m.idRoom === idRoom && !m.isDeleted)
            .sort((a, b) => b.sentAt.localeCompare(a.sentAt))[0];
    }

    private getUnreadCount(idRoom: number): number {
        const user = this.currentChatUser;
        if (!user) return 0;
        return this._messages().filter((m) => m.idRoom === idRoom && m.idSender !== user.idUser && m.status !== 'READ' && !m.isDeleted).length;
    }
}
