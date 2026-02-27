// src/app/modules/chat/chat.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, signal, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { BadgeModule } from 'primeng/badge';
import { MessageService } from 'primeng/api';

import { ChatService } from '../../core/services/conf/chat.service';
import { ChatRoomMock, ChatMessageMock, ChatUserMock } from '../../shared/data/chat.mock';

// Emojis disponibles para grupos
const GROUP_EMOJIS = ['👥', '💬', '📚', '🎭', '💰', '🏫', '📋', '🎯', '🔔', '⚽', '🎨', '🔧'];

@Component({
    selector: 'app-chat',
    standalone: true,
    imports: [CommonModule, FormsModule, ToastModule, TooltipModule, BadgeModule],
    templateUrl: './chat.component.html',
    styleUrl: './chat.component.scss',
    providers: [MessageService]
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {
    // ── Estado principal ──────────────────────────────────────────────────────
    rooms = signal<ChatRoomMock[]>([]);
    messages = signal<ChatMessageMock[]>([]);
    activeRoom = signal<ChatRoomMock | null>(null);
    loading = signal(true);
    loadingMsgs = signal(false);
    sending = signal(false);

    isAdmin = false;
    adminStats = signal<any>(null);
    showAdminPanel = signal(false);

    // ── Input ─────────────────────────────────────────────────────────────────
    messageText = '';
    replyTo = signal<ChatMessageMock | null>(null);

    // ── Modal nuevo chat (pestaña privado / grupo) ────────────────────────────
    showNewChatModal = signal(false);
    newChatTab = signal<'PRIVATE' | 'GROUP'>('PRIVATE');
    availableUsers = signal<ChatUserMock[]>([]);

    // Grupo
    groupName = '';
    groupEmoji = '👥';
    groupEmojiList = GROUP_EMOJIS;
    selectedMemberIds = signal<number[]>([]);
    showEmojiPicker = signal(false);

    // ── Detalle de grupo (panel lateral) ─────────────────────────────────────
    showGroupDetail = signal(false);
    groupMembers = signal<ChatUserMock[]>([]);

    private shouldScroll = false;
    @ViewChild('messagesContainer') messagesContainer!: ElementRef<HTMLElement>;
    private destroy$ = new Subject<void>();

    constructor(
        private chatService: ChatService,
        private messageService: MessageService
    ) {}

    ngOnInit(): void {
        this.isAdmin = this.chatService.isAdmin;
        this.loadRooms();
        if (this.isAdmin) this.loadAdminStats();
    }

    ngOnDestroy(): void {
        this.chatService.setActiveRoom(null);
        this.destroy$.next();
        this.destroy$.complete();
    }

    ngAfterViewChecked(): void {
        if (this.shouldScroll) {
            this.scrollToBottom();
            this.shouldScroll = false;
        }
    }

    // ── Carga ─────────────────────────────────────────────────────────────────

    loadRooms(): void {
        this.loading.set(true);
        this.chatService
            .getVisibleRooms()
            .pipe(takeUntil(this.destroy$))
            .subscribe((rooms) => {
                this.rooms.set(rooms);
                this.loading.set(false);
                if (rooms.length > 0 && !this.activeRoom()) this.selectRoom(rooms[0]);
            });
    }

    loadAdminStats(): void {
        this.chatService
            .getAdminRoomStats()
            .pipe(takeUntil(this.destroy$))
            .subscribe((s) => this.adminStats.set(s));
    }

    // ── Sala activa ───────────────────────────────────────────────────────────

    selectRoom(room: ChatRoomMock): void {
        this.activeRoom.set(room);
        this.chatService.setActiveRoom(room);
        this.replyTo.set(null);
        this.showGroupDetail.set(false);
        this.loadMessages(room.idRoom);
        this.rooms.update((rs) => rs.map((r) => (r.idRoom === room.idRoom ? { ...r, unreadCount: 0 } : r)));

        // Si es grupo, cargar miembros
        if (room.type === 'GROUP') {
            this.groupMembers.set(this.chatService.getGroupMembers(room));
        }
    }

    loadMessages(idRoom: number): void {
        this.loadingMsgs.set(true);
        this.chatService
            .getMessages(idRoom)
            .pipe(takeUntil(this.destroy$))
            .subscribe((msgs) => {
                this.messages.set(msgs);
                this.loadingMsgs.set(false);
                this.shouldScroll = true;
            });
    }

    // ── Envío ─────────────────────────────────────────────────────────────────

    sendMessage(): void {
        const room = this.activeRoom();
        if (!room || !this.messageText.trim() || this.sending()) return;

        const content = this.messageText;
        const replyId = this.replyTo()?.idMessage;
        this.messageText = '';
        this.replyTo.set(null);
        this.sending.set(true);

        this.chatService
            .sendMessage(room.idRoom, content, replyId)
            .pipe(takeUntil(this.destroy$))
            .subscribe((msg) => {
                this.messages.update((msgs) => [...msgs, msg]);
                this.sending.set(false);
                this.shouldScroll = true;
                this.rooms.update((rs) => rs.map((r) => (r.idRoom === room.idRoom ? { ...r, lastMessage: msg } : r)));
            });
    }

    onKeyDown(e: KeyboardEvent): void {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            this.sendMessage();
        }
    }

    // ── Reply ─────────────────────────────────────────────────────────────────

    setReply(msg: ChatMessageMock): void {
        this.replyTo.set(msg);
    }
    clearReply(): void {
        this.replyTo.set(null);
    }

    // ── Eliminar ──────────────────────────────────────────────────────────────

    deleteMessage(msg: ChatMessageMock): void {
        const me = this.chatService.currentChatUser;
        if (!me || (msg.idSender !== me.idUser && !this.isAdmin)) return;

        this.chatService
            .deleteMessage(msg.idMessage)
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => {
                this.messages.update((msgs) => msgs.filter((m) => m.idMessage !== msg.idMessage));
                this.messageService.add({ severity: 'info', summary: 'Mensaje eliminado', life: 2000 });
            });
    }

    // ── Modal nuevo chat ──────────────────────────────────────────────────────

    openNewChatModal(tab: 'PRIVATE' | 'GROUP' = 'PRIVATE'): void {
        this.availableUsers.set(this.chatService.getAllUsers());
        this.newChatTab.set(tab);
        this.groupName = '';
        this.groupEmoji = '👥';
        this.selectedMemberIds.set([]);
        this.showEmojiPicker.set(false);
        this.showNewChatModal.set(true);
    }

    closeNewChatModal(): void {
        this.showNewChatModal.set(false);
    }

    // ── Crear privado ─────────────────────────────────────────────────────────

    startPrivateChat(user: ChatUserMock): void {
        this.closeNewChatModal();
        this.chatService
            .createPrivateRoom(user.idUser)
            .pipe(takeUntil(this.destroy$))
            .subscribe((room) => {
                this.loadRooms();
                setTimeout(() => this.selectRoom(room), 200);
            });
    }

    // ── Crear grupo ───────────────────────────────────────────────────────────

    toggleGroupMember(userId: number): void {
        this.selectedMemberIds.update((ids) => (ids.includes(userId) ? ids.filter((id) => id !== userId) : [...ids, userId]));
    }

    isMemberSelected(userId: number): boolean {
        return this.selectedMemberIds().includes(userId);
    }

    createGroup(): void {
        if (!this.groupName.trim() || this.selectedMemberIds().length < 2) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Datos incompletos',
                detail: 'Ingresá un nombre y seleccioná al menos 2 miembros'
            });
            return;
        }
        this.closeNewChatModal();
        this.chatService
            .createGroupRoom(this.groupName, this.selectedMemberIds(), this.groupEmoji)
            .pipe(takeUntil(this.destroy$))
            .subscribe((room) => {
                this.loadRooms();
                setTimeout(() => this.selectRoom(room), 200);
                this.messageService.add({ severity: 'success', summary: `Grupo "${room.name}" creado`, life: 3000 });
            });
    }

    selectGroupEmoji(emoji: string): void {
        this.groupEmoji = emoji;
        this.showEmojiPicker.set(false);
    }

    // ── Getters sidebar ───────────────────────────────────────────────────────

    get hasRoleRooms(): boolean {
        return this.rooms().some((r: ChatRoomMock) => r.type === 'ROLE');
    }
    get hasGroupRooms(): boolean {
        return this.rooms().some((r: ChatRoomMock) => r.type === 'GROUP');
    }
    get hasPrivateRooms(): boolean {
        return this.rooms().some((r: ChatRoomMock) => r.type === 'PRIVATE');
    }

    totalUnread(): number {
        return this.rooms().reduce((a, r) => a + (r.unreadCount ?? 0), 0);
    }

    // ── Helpers de display ────────────────────────────────────────────────────

    get currentUser() {
        return this.chatService.currentChatUser;
    }

    getRoomDisplayName(room: ChatRoomMock): string {
        return this.chatService.getRoomDisplayName(room);
    }

    getRoomOtherUser(room: ChatRoomMock): ChatUserMock | null {
        return this.chatService.getRoomOtherUser(room);
    }

    getRoomIcon(room: ChatRoomMock): string {
        if (room.type === 'GROUP') return room.groupAvatar ?? '👥';
        if (room.type === 'GENERAL') return '#';
        return '⊕';
    }

    getRoleColor(role: string): string {
        const m: Record<string, string> = {
            ADMIN: '#6366f1',
            DOCENTE: '#10b981',
            FINANZAS: '#f59e0b',
            PORTERO: '#ef4444',
            PADRE: '#14b8a6'
        };
        return m[role] ?? '#94a3b8';
    }

    isOwnMessage(msg: ChatMessageMock): boolean {
        return msg.idSender === this.currentUser?.idUser;
    }

    formatTime(iso: string): string {
        const d = new Date(iso);
        const now = new Date();
        if (d.getDate() === now.getDate() && now.getTime() - d.getTime() < 86400000) {
            return d.toLocaleTimeString('es-PY', { hour: '2-digit', minute: '2-digit' });
        }
        return d.toLocaleDateString('es-PY', { day: '2-digit', month: '2-digit' }) + ' ' + d.toLocaleTimeString('es-PY', { hour: '2-digit', minute: '2-digit' });
    }

    formatLastMessage(room: ChatRoomMock): string {
        const m = room.lastMessage;
        if (!m) return 'Sin mensajes';
        const prefix = m.idSender === this.currentUser?.idUser ? 'Vos: ' : room.type === 'GROUP' ? m.senderName.split(' ')[0] + ': ' : '';
        return prefix + m.content.slice(0, 38) + (m.content.length > 38 ? '...' : '');
    }

    getUserOnlineStatus(room: ChatRoomMock): boolean {
        return this.getRoomOtherUser(room)?.isOnline ?? false;
    }

    getGroupMemberPreview(room: ChatRoomMock): string {
        const members = this.chatService.getGroupMembers(room);
        return (
            members
                .map((u) => u.fullName.split(' ')[0])
                .slice(0, 3)
                .join(', ') + (members.length > 3 ? ` +${members.length - 3}` : '')
        );
    }

    private scrollToBottom(): void {
        try {
            const el = this.messagesContainer?.nativeElement;
            if (el) el.scrollTop = el.scrollHeight;
        } catch {}
    }
}
