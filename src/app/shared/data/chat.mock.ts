// src/app/shared/data/chat.mock.ts
// ══════════════════════════════════════════════════════════════════════════════
// CHAT MOCK DATA — EasySys
// Roles: ADMIN (ve todo), DOCENTE, FINANZAS, PORTERO, PADRE
// Tipos: GENERAL | ROLE | PRIVATE (2 personas) | GROUP (3+ personas con nombre)
// ══════════════════════════════════════════════════════════════════════════════

export type ChatRoomType = 'GENERAL' | 'ROLE' | 'PRIVATE' | 'GROUP';
export type ChatRole = 'ADMIN' | 'DOCENTE' | 'FINANZAS' | 'PORTERO' | 'PADRE';
export type MessageStatus = 'SENT' | 'DELIVERED' | 'READ';

export interface ChatUserMock {
    idUser: number;
    username: string;
    fullName: string;
    role: ChatRole;
    avatarColor: string;
    initials: string;
    isOnline: boolean;
    lastSeen?: string;
}

export interface ChatRoomMock {
    idRoom: number;
    idCompany: number;
    name: string;
    description?: string;
    type: ChatRoomType;
    allowedRole?: ChatRole; // solo ROLE
    members?: number[]; // PRIVATE (2) y GROUP (3+)
    groupAvatar?: string; // emoji o color para el grupo
    createdBy: number;
    createdAt: string;
    isActive: boolean;
    // Computed en runtime
    unreadCount?: number;
    lastMessage?: ChatMessageMock;
}

export interface ChatMessageMock {
    idMessage: number;
    idRoom: number;
    idSender: number;
    senderName: string;
    senderInitials: string;
    senderColor: string;
    senderRole: ChatRole;
    content: string;
    sentAt: string;
    status: MessageStatus;
    isDeleted: boolean;
    replyTo?: number;
    replyPreview?: string;
}

// ── Usuarios ──────────────────────────────────────────────────────────────────

export const MOCK_CHAT_USERS: ChatUserMock[] = [
    { idUser: 1, username: 'admin', fullName: 'Roberto Sánchez Duarte', role: 'ADMIN', avatarColor: '#6366f1', initials: 'RS', isOnline: true },
    { idUser: 2, username: 'docente', fullName: 'Ana Giménez Rojas', role: 'DOCENTE', avatarColor: '#10b981', initials: 'AG', isOnline: true, lastSeen: new Date().toISOString() },
    { idUser: 3, username: 'finanzas', fullName: 'Elena Figueredo Páez', role: 'FINANZAS', avatarColor: '#f59e0b', initials: 'EF', isOnline: false, lastSeen: new Date(Date.now() - 25 * 60000).toISOString() },
    { idUser: 4, username: 'portero', fullName: 'Carlos Benítez Coronel', role: 'PORTERO', avatarColor: '#ef4444', initials: 'CB', isOnline: true, lastSeen: new Date().toISOString() },
    { idUser: 5, username: 'docente2', fullName: 'Mario Villalba Torres', role: 'DOCENTE', avatarColor: '#0ea5e9', initials: 'MV', isOnline: false, lastSeen: new Date(Date.now() - 2 * 3600000).toISOString() },
    { idUser: 6, username: 'docente3', fullName: 'Lucía Cabrera Méndez', role: 'DOCENTE', avatarColor: '#ec4899', initials: 'LC', isOnline: true },
    // Padres/tutores — solo pueden participar en PRIVATE con docentes o admin
    { idUser: 7, username: 'padre1', fullName: 'Jorge García Ruiz', role: 'PADRE', avatarColor: '#14b8a6', initials: 'JG', isOnline: false, lastSeen: new Date(Date.now() - 45 * 60000).toISOString() },
    { idUser: 8, username: 'padre2', fullName: 'Carmen López Vera', role: 'PADRE', avatarColor: '#a855f7', initials: 'CL', isOnline: true },
    // Segundo usuario de finanzas
    { idUser: 9, username: 'finanzas2', fullName: 'Diego Romero Acosta', role: 'FINANZAS', avatarColor: '#f97316', initials: 'DR', isOnline: true }
];

// ── Salas ─────────────────────────────────────────────────────────────────────

export const MOCK_CHAT_ROOMS: ChatRoomMock[] = [
    // ── Generales y por rol ────────────────────────────────────────────────────
    { idRoom: 1, idCompany: 1, name: 'General', description: 'Canal general institucional', type: 'GENERAL', createdBy: 1, createdAt: '2025-02-01T08:00:00', isActive: true },
    { idRoom: 2, idCompany: 1, name: 'Sala Docentes', description: 'Canal exclusivo del equipo docente', type: 'ROLE', allowedRole: 'DOCENTE', createdBy: 1, createdAt: '2025-02-01T08:00:00', isActive: true },
    { idRoom: 3, idCompany: 1, name: 'Sala Finanzas', description: 'Gestión económica y pagos', type: 'ROLE', allowedRole: 'FINANZAS', createdBy: 1, createdAt: '2025-02-01T08:00:00', isActive: true },
    { idRoom: 4, idCompany: 1, name: 'Sala Portería', description: 'Coordinación de accesos y seguridad', type: 'ROLE', allowedRole: 'PORTERO', createdBy: 1, createdAt: '2025-02-01T08:00:00', isActive: true },

    // ── Privados entre staff ───────────────────────────────────────────────────
    { idRoom: 5, idCompany: 1, name: 'Privado', type: 'PRIVATE', members: [1, 2], createdBy: 1, createdAt: '2025-02-10T09:00:00', isActive: true }, // Admin ↔ Ana
    { idRoom: 6, idCompany: 1, name: 'Privado', type: 'PRIVATE', members: [1, 3], createdBy: 1, createdAt: '2025-02-12T11:00:00', isActive: true }, // Admin ↔ Elena
    { idRoom: 7, idCompany: 1, name: 'Privado', type: 'PRIVATE', members: [2, 6], createdBy: 2, createdAt: '2025-02-14T10:00:00', isActive: true }, // Ana ↔ Lucía

    // ── Privados con padres ───────────────────────────────────────────────────
    { idRoom: 8, idCompany: 1, name: 'Privado', type: 'PRIVATE', members: [2, 7], createdBy: 2, createdAt: '2025-02-18T09:00:00', isActive: true }, // Ana (docente) ↔ Jorge García (padre)
    { idRoom: 9, idCompany: 1, name: 'Privado', type: 'PRIVATE', members: [3, 8], createdBy: 3, createdAt: '2025-02-20T10:00:00', isActive: true }, // Elena (finanzas) ↔ Carmen López (padre)

    // ── Privado entre dos usuarios de finanzas ────────────────────────────────
    { idRoom: 10, idCompany: 1, name: 'Privado', type: 'PRIVATE', members: [3, 9], createdBy: 3, createdAt: '2025-02-22T08:00:00', isActive: true }, // Elena ↔ Diego (finanzas2)

    // ── Grupos ────────────────────────────────────────────────────────────────
    {
        idRoom: 11,
        idCompany: 1,
        name: 'Comisión Acto Escolar',
        description: 'Coordinación del acto del 25 de Mayo',
        type: 'GROUP',
        members: [1, 2, 5, 6],
        groupAvatar: '🎭',
        createdBy: 1,
        createdAt: '2025-02-15T08:00:00',
        isActive: true
    },
    {
        idRoom: 12,
        idCompany: 1,
        name: 'Equipo Pedagógico 7°B',
        description: 'Seguimiento académico del curso 7° B',
        type: 'GROUP',
        members: [1, 2, 5],
        groupAvatar: '📚',
        createdBy: 1,
        createdAt: '2025-02-17T09:00:00',
        isActive: true
    },
    {
        idRoom: 13,
        idCompany: 1,
        name: 'Admin + Finanzas',
        description: 'Coordinación presupuestaria',
        type: 'GROUP',
        members: [1, 3, 9],
        groupAvatar: '💰',
        createdBy: 1,
        createdAt: '2025-02-19T10:00:00',
        isActive: true
    }
];

// ── Mensajes ──────────────────────────────────────────────────────────────────

const now = Date.now();
const mins = (m: number) => new Date(now - m * 60000).toISOString();
const hrs = (h: number) => new Date(now - h * 3600000).toISOString();

export const MOCK_CHAT_MESSAGES: ChatMessageMock[] = [
    // General (1)
    {
        idMessage: 1,
        idRoom: 1,
        idSender: 1,
        senderName: 'Roberto Sánchez',
        senderInitials: 'RS',
        senderColor: '#6366f1',
        senderRole: 'ADMIN',
        content: 'Buenos días a todos. Recordamos que el viernes 28 habrá reunión general de docentes a las 14:00hs.',
        sentAt: hrs(5),
        status: 'READ',
        isDeleted: false
    },
    {
        idMessage: 2,
        idRoom: 1,
        idSender: 2,
        senderName: 'Ana Giménez',
        senderInitials: 'AG',
        senderColor: '#10b981',
        senderRole: 'DOCENTE',
        content: 'Confirmado, estaré presente. ¿Se necesita preparar algo?',
        sentAt: hrs(4.8),
        status: 'READ',
        isDeleted: false
    },
    {
        idMessage: 3,
        idRoom: 1,
        idSender: 1,
        senderName: 'Roberto Sánchez',
        senderInitials: 'RS',
        senderColor: '#6366f1',
        senderRole: 'ADMIN',
        content: 'Solo traer las planillas de calificaciones del primer trimestre.',
        sentAt: hrs(4.7),
        status: 'READ',
        isDeleted: false
    },
    {
        idMessage: 4,
        idRoom: 1,
        idSender: 5,
        senderName: 'Mario Villalba',
        senderInitials: 'MV',
        senderColor: '#0ea5e9',
        senderRole: 'DOCENTE',
        content: '¿La reunión será en el salón de actos o en la sala de profesores?',
        sentAt: hrs(4.5),
        status: 'READ',
        isDeleted: false
    },
    {
        idMessage: 5,
        idRoom: 1,
        idSender: 1,
        senderName: 'Roberto Sánchez',
        senderInitials: 'RS',
        senderColor: '#6366f1',
        senderRole: 'ADMIN',
        content: 'Salón de actos. Habrá proyector disponible.',
        sentAt: hrs(4.3),
        status: 'READ',
        isDeleted: false
    },
    {
        idMessage: 6,
        idRoom: 1,
        idSender: 3,
        senderName: 'Elena Figueredo',
        senderInitials: 'EF',
        senderColor: '#f59e0b',
        senderRole: 'FINANZAS',
        content: 'Desde finanzas les recordamos que el plazo para el pago de cuotas atrasadas vence el 30 de este mes.',
        sentAt: hrs(3),
        status: 'READ',
        isDeleted: false
    },
    {
        idMessage: 7,
        idRoom: 1,
        idSender: 4,
        senderName: 'Carlos Benítez',
        senderInitials: 'CB',
        senderColor: '#ef4444',
        senderRole: 'PORTERO',
        content: 'Aviso: el portón norte estará en mantenimiento mañana de 7 a 9hs. Usar entrada principal.',
        sentAt: hrs(2),
        status: 'READ',
        isDeleted: false
    },
    { idMessage: 8, idRoom: 1, idSender: 6, senderName: 'Lucía Cabrera', senderInitials: 'LC', senderColor: '#ec4899', senderRole: 'DOCENTE', content: 'Gracias Carlos por el aviso 👍', sentAt: hrs(1.9), status: 'READ', isDeleted: false },
    {
        idMessage: 9,
        idRoom: 1,
        idSender: 2,
        senderName: 'Ana Giménez',
        senderInitials: 'AG',
        senderColor: '#10b981',
        senderRole: 'DOCENTE',
        content: '¿Se coordina algo para el acto del Día del Maestro?',
        sentAt: mins(45),
        status: 'DELIVERED',
        isDeleted: false
    },
    {
        idMessage: 10,
        idRoom: 1,
        idSender: 1,
        senderName: 'Roberto Sánchez',
        senderInitials: 'RS',
        senderColor: '#6366f1',
        senderRole: 'ADMIN',
        content: 'Sí, les paso el programa esta tarde por este canal.',
        sentAt: mins(30),
        status: 'DELIVERED',
        isDeleted: false
    },

    // Sala Docentes (2)
    {
        idMessage: 11,
        idRoom: 2,
        idSender: 2,
        senderName: 'Ana Giménez',
        senderInitials: 'AG',
        senderColor: '#10b981',
        senderRole: 'DOCENTE',
        content: 'Compañeros, ¿alguien tiene el libro de actas del 3° trimestre 2024?',
        sentAt: hrs(6),
        status: 'READ',
        isDeleted: false
    },
    {
        idMessage: 12,
        idRoom: 2,
        idSender: 5,
        senderName: 'Mario Villalba',
        senderInitials: 'MV',
        senderColor: '#0ea5e9',
        senderRole: 'DOCENTE',
        content: 'Sí, lo tengo yo. Paso a dejarlo mañana en secretaría.',
        sentAt: hrs(5.8),
        status: 'READ',
        isDeleted: false
    },
    {
        idMessage: 13,
        idRoom: 2,
        idSender: 6,
        senderName: 'Lucía Cabrera',
        senderInitials: 'LC',
        senderColor: '#ec4899',
        senderRole: 'DOCENTE',
        content: 'Necesito que alguien me cubra el lunes 3° hora, tengo cita médica.',
        sentAt: hrs(3),
        status: 'READ',
        isDeleted: false
    },
    {
        idMessage: 14,
        idRoom: 2,
        idSender: 5,
        senderName: 'Mario Villalba',
        senderInitials: 'MV',
        senderColor: '#0ea5e9',
        senderRole: 'DOCENTE',
        content: 'Yo puedo cubrirte Lucía, avísame el tema y curso.',
        sentAt: hrs(2.9),
        status: 'READ',
        isDeleted: false
    },
    {
        idMessage: 15,
        idRoom: 2,
        idSender: 6,
        senderName: 'Lucía Cabrera',
        senderInitials: 'LC',
        senderColor: '#ec4899',
        senderRole: 'DOCENTE',
        content: '¡Gracias Mario! Es 7° B, Matemáticas. Repaso de fracciones.',
        sentAt: hrs(2.8),
        status: 'READ',
        isDeleted: false
    },
    {
        idMessage: 16,
        idRoom: 2,
        idSender: 1,
        senderName: 'Roberto Sánchez',
        senderInitials: 'RS',
        senderColor: '#6366f1',
        senderRole: 'ADMIN',
        content: 'Queda registrado el cambio. Recuerden completar el libro de asistencia.',
        sentAt: hrs(2.5),
        status: 'READ',
        isDeleted: false
    },
    {
        idMessage: 17,
        idRoom: 2,
        idSender: 2,
        senderName: 'Ana Giménez',
        senderInitials: 'AG',
        senderColor: '#10b981',
        senderRole: 'DOCENTE',
        content: 'Las planillas de notas del primer trimestre, ¿hasta cuándo hay que entregarlas?',
        sentAt: mins(20),
        status: 'DELIVERED',
        isDeleted: false
    },

    // Sala Finanzas (3)
    {
        idMessage: 18,
        idRoom: 3,
        idSender: 3,
        senderName: 'Elena Figueredo',
        senderInitials: 'EF',
        senderColor: '#f59e0b',
        senderRole: 'FINANZAS',
        content: 'Reporte de morosidad: 12 alumnos con cuotas atrasadas. Se enviaron avisos esta mañana.',
        sentAt: hrs(4),
        status: 'READ',
        isDeleted: false
    },
    {
        idMessage: 19,
        idRoom: 3,
        idSender: 1,
        senderName: 'Roberto Sánchez',
        senderInitials: 'RS',
        senderColor: '#6366f1',
        senderRole: 'ADMIN',
        content: 'Bien. Si llegan a 15 días de atraso, escalar a dirección.',
        sentAt: hrs(3.9),
        status: 'READ',
        isDeleted: false
    },
    {
        idMessage: 20,
        idRoom: 3,
        idSender: 9,
        senderName: 'Diego Romero',
        senderInitials: 'DR',
        senderColor: '#f97316',
        senderRole: 'FINANZAS',
        content: 'El sistema de cobros tuvo un error hoy. Revisando con IT.',
        sentAt: hrs(3.5),
        status: 'READ',
        isDeleted: false
    },
    {
        idMessage: 21,
        idRoom: 3,
        idSender: 3,
        senderName: 'Elena Figueredo',
        senderInitials: 'EF',
        senderColor: '#f59e0b',
        senderRole: 'FINANZAS',
        content: 'También tenemos 3 casos de becas pendientes de aprobación.',
        sentAt: hrs(3.8),
        status: 'READ',
        isDeleted: false
    },
    {
        idMessage: 22,
        idRoom: 3,
        idSender: 3,
        senderName: 'Elena Figueredo',
        senderInitials: 'EF',
        senderColor: '#f59e0b',
        senderRole: 'FINANZAS',
        content: 'Ya enviados. Incluí el detalle de cada caso.',
        sentAt: mins(50),
        status: 'DELIVERED',
        isDeleted: false
    },

    // Sala Portería (4)
    {
        idMessage: 23,
        idRoom: 4,
        idSender: 4,
        senderName: 'Carlos Benítez',
        senderInitials: 'CB',
        senderColor: '#ef4444',
        senderRole: 'PORTERO',
        content: 'Turno mañana: ingresaron 287 alumnos de los 312 esperados.',
        sentAt: hrs(5),
        status: 'READ',
        isDeleted: false
    },
    {
        idMessage: 24,
        idRoom: 4,
        idSender: 1,
        senderName: 'Roberto Sánchez',
        senderInitials: 'RS',
        senderColor: '#6366f1',
        senderRole: 'ADMIN',
        content: 'Gracias Carlos. ¿Los ausentes tienen justificativo registrado?',
        sentAt: hrs(4.9),
        status: 'READ',
        isDeleted: false
    },
    {
        idMessage: 25,
        idRoom: 4,
        idSender: 4,
        senderName: 'Carlos Benítez',
        senderInitials: 'CB',
        senderColor: '#ef4444',
        senderRole: 'PORTERO',
        content: 'De los 25 ausentes, 18 tienen aviso previo. 7 sin comunicación.',
        sentAt: hrs(4.8),
        status: 'READ',
        isDeleted: false
    },
    {
        idMessage: 26,
        idRoom: 4,
        idSender: 4,
        senderName: 'Carlos Benítez',
        senderInitials: 'CB',
        senderColor: '#ef4444',
        senderRole: 'PORTERO',
        content: 'Retiro de menores: 3 retiros anticipados por familiar autorizado. Todo en regla.',
        sentAt: mins(15),
        status: 'SENT',
        isDeleted: false
    },

    // Privado Admin ↔ Ana (5)
    {
        idMessage: 27,
        idRoom: 5,
        idSender: 1,
        senderName: 'Roberto Sánchez',
        senderInitials: 'RS',
        senderColor: '#6366f1',
        senderRole: 'ADMIN',
        content: 'Ana, ¿podés quedarte un momento después de la reunión? Necesito hablar sobre el caso García.',
        sentAt: hrs(3),
        status: 'READ',
        isDeleted: false
    },
    {
        idMessage: 28,
        idRoom: 5,
        idSender: 2,
        senderName: 'Ana Giménez',
        senderInitials: 'AG',
        senderColor: '#10b981',
        senderRole: 'DOCENTE',
        content: 'Claro Roberto, no hay problema. ¿Es algo urgente?',
        sentAt: hrs(2.9),
        status: 'READ',
        isDeleted: false
    },
    {
        idMessage: 29,
        idRoom: 5,
        idSender: 2,
        senderName: 'Ana Giménez',
        senderInitials: 'AG',
        senderColor: '#10b981',
        senderRole: 'DOCENTE',
        content: 'Perfecto, preparo un breve informe para tener los datos a mano.',
        sentAt: mins(40),
        status: 'DELIVERED',
        isDeleted: false
    },

    // Privado Admin ↔ Elena (6)
    {
        idMessage: 30,
        idRoom: 6,
        idSender: 3,
        senderName: 'Elena Figueredo',
        senderInitials: 'EF',
        senderColor: '#f59e0b',
        senderRole: 'FINANZAS',
        content: 'Director, el proveedor solicita confirmación del pedido para esta semana.',
        sentAt: hrs(2),
        status: 'READ',
        isDeleted: false
    },
    {
        idMessage: 31,
        idRoom: 6,
        idSender: 1,
        senderName: 'Roberto Sánchez',
        senderInitials: 'RS',
        senderColor: '#6366f1',
        senderRole: 'ADMIN',
        content: 'Confirmado. Dentro del presupuesto aprobado. Procedé con la orden.',
        sentAt: hrs(1.9),
        status: 'READ',
        isDeleted: false
    },
    {
        idMessage: 32,
        idRoom: 6,
        idSender: 3,
        senderName: 'Elena Figueredo',
        senderInitials: 'EF',
        senderColor: '#f59e0b',
        senderRole: 'FINANZAS',
        content: 'Entendido, emito la orden ahora mismo.',
        sentAt: mins(60),
        status: 'DELIVERED',
        isDeleted: false
    },

    // Privado Ana ↔ Lucía (7)
    {
        idMessage: 33,
        idRoom: 7,
        idSender: 6,
        senderName: 'Lucía Cabrera',
        senderInitials: 'LC',
        senderColor: '#ec4899',
        senderRole: 'DOCENTE',
        content: 'Ana, ¿tenés el material de Lengua para 6° grado?',
        sentAt: hrs(1),
        status: 'READ',
        isDeleted: false
    },
    {
        idMessage: 34,
        idRoom: 7,
        idSender: 2,
        senderName: 'Ana Giménez',
        senderInitials: 'AG',
        senderColor: '#10b981',
        senderRole: 'DOCENTE',
        content: 'Sí, tengo el digital. Te lo mando al mail ahora.',
        sentAt: mins(55),
        status: 'READ',
        isDeleted: false
    },
    {
        idMessage: 35,
        idRoom: 7,
        idSender: 6,
        senderName: 'Lucía Cabrera',
        senderInitials: 'LC',
        senderColor: '#ec4899',
        senderRole: 'DOCENTE',
        content: '¡Muchas gracias! Lo necesitaba para el lunes.',
        sentAt: mins(50),
        status: 'DELIVERED',
        isDeleted: false
    },

    // ── NUEVO: Privado Ana (docente) ↔ Jorge García (padre) (8) ──────────────
    {
        idMessage: 36,
        idRoom: 8,
        idSender: 7,
        senderName: 'Jorge García',
        senderInitials: 'JG',
        senderColor: '#14b8a6',
        senderRole: 'PADRE',
        content: 'Buen día profesora Ana. Quería consultar sobre el rendimiento de mi hijo Tomás en matemáticas.',
        sentAt: hrs(3.5),
        status: 'READ',
        isDeleted: false
    },
    {
        idMessage: 37,
        idRoom: 8,
        idSender: 2,
        senderName: 'Ana Giménez',
        senderInitials: 'AG',
        senderColor: '#10b981',
        senderRole: 'DOCENTE',
        content: 'Buen día Sr. García. Tomás está mostrando mejoras, aprobó el último examen con 7. Le falta un poco más de práctica en ecuaciones.',
        sentAt: hrs(3.3),
        status: 'READ',
        isDeleted: false
    },
    {
        idMessage: 38,
        idRoom: 8,
        idSender: 7,
        senderName: 'Jorge García',
        senderInitials: 'JG',
        senderColor: '#14b8a6',
        senderRole: 'PADRE',
        content: 'Me alegra escuchar eso. ¿Hay algún material que pueda trabajar con él en casa?',
        sentAt: hrs(3.1),
        status: 'READ',
        isDeleted: false
    },
    {
        idMessage: 39,
        idRoom: 8,
        idSender: 2,
        senderName: 'Ana Giménez',
        senderInitials: 'AG',
        senderColor: '#10b981',
        senderRole: 'DOCENTE',
        content: 'Le voy a enviar un ejercitario práctico. También recomiendo que repase el capítulo 4 del libro de texto.',
        sentAt: hrs(3.0),
        status: 'READ',
        isDeleted: false
    },
    {
        idMessage: 40,
        idRoom: 8,
        idSender: 7,
        senderName: 'Jorge García',
        senderInitials: 'JG',
        senderColor: '#14b8a6',
        senderRole: 'PADRE',
        content: 'Perfecto, muchas gracias profesora. Estaré pendiente.',
        sentAt: mins(35),
        status: 'DELIVERED',
        isDeleted: false
    },

    // ── NUEVO: Privado Elena (finanzas) ↔ Carmen López (padre) (9) ───────────
    {
        idMessage: 41,
        idRoom: 9,
        idSender: 8,
        senderName: 'Carmen López',
        senderInitials: 'CL',
        senderColor: '#a855f7',
        senderRole: 'PADRE',
        content: 'Buenas tardes, llamo por la cuota de febrero que figura como pendiente. Ya realicé el pago la semana pasada.',
        sentAt: hrs(4.2),
        status: 'READ',
        isDeleted: false
    },
    {
        idMessage: 42,
        idRoom: 9,
        idSender: 3,
        senderName: 'Elena Figueredo',
        senderInitials: 'EF',
        senderColor: '#f59e0b',
        senderRole: 'FINANZAS',
        content: 'Buenas tardes Sra. López. Voy a verificar en el sistema. ¿Tiene el comprobante de la transferencia?',
        sentAt: hrs(4.0),
        status: 'READ',
        isDeleted: false
    },
    {
        idMessage: 43,
        idRoom: 9,
        idSender: 8,
        senderName: 'Carmen López',
        senderInitials: 'CL',
        senderColor: '#a855f7',
        senderRole: 'PADRE',
        content: 'Sí, lo tengo. El número de operación es 7823941. Fue el martes 18.',
        sentAt: hrs(3.9),
        status: 'READ',
        isDeleted: false
    },
    {
        idMessage: 44,
        idRoom: 9,
        idSender: 3,
        senderName: 'Elena Figueredo',
        senderInitials: 'EF',
        senderColor: '#f59e0b',
        senderRole: 'FINANZAS',
        content: 'Encontré el pago. Fue acreditado pero con error en el código de alumno. Lo corrijo en el sistema ahora mismo.',
        sentAt: hrs(3.7),
        status: 'READ',
        isDeleted: false
    },
    {
        idMessage: 45,
        idRoom: 9,
        idSender: 8,
        senderName: 'Carmen López',
        senderInitials: 'CL',
        senderColor: '#a855f7',
        senderRole: 'PADRE',
        content: 'Muchas gracias por la rapidez. Quedo tranquila entonces.',
        sentAt: mins(25),
        status: 'DELIVERED',
        isDeleted: false
    },

    // ── NUEVO: Privado Elena ↔ Diego (dos de finanzas) (10) ──────────────────
    {
        idMessage: 46,
        idRoom: 10,
        idSender: 9,
        senderName: 'Diego Romero',
        senderInitials: 'DR',
        senderColor: '#f97316',
        senderRole: 'FINANZAS',
        content: 'Elena, el cierre mensual ya está listo. ¿Lo revisás antes de mandarlo a dirección?',
        sentAt: hrs(2.5),
        status: 'READ',
        isDeleted: false
    },
    {
        idMessage: 47,
        idRoom: 10,
        idSender: 3,
        senderName: 'Elena Figueredo',
        senderInitials: 'EF',
        senderColor: '#f59e0b',
        senderRole: 'FINANZAS',
        content: 'Sí, lo veo ahora. ¿Incluiste los ajustes de las becas nuevas?',
        sentAt: hrs(2.3),
        status: 'READ',
        isDeleted: false
    },
    {
        idMessage: 48,
        idRoom: 10,
        idSender: 9,
        senderName: 'Diego Romero',
        senderInitials: 'DR',
        senderColor: '#f97316',
        senderRole: 'FINANZAS',
        content: 'Sí, están en la hoja 3. Total ajuste: G. 2.450.000.',
        sentAt: hrs(2.1),
        status: 'READ',
        isDeleted: false
    },
    {
        idMessage: 49,
        idRoom: 10,
        idSender: 3,
        senderName: 'Elena Figueredo',
        senderInitials: 'EF',
        senderColor: '#f59e0b',
        senderRole: 'FINANZAS',
        content: 'Perfecto, lo apruebo. Mandámelo por correo para adjuntar la firma digital.',
        sentAt: mins(70),
        status: 'DELIVERED',
        isDeleted: false
    },

    // ── NUEVO: Grupo Comisión Acto Escolar (11) ───────────────────────────────
    {
        idMessage: 50,
        idRoom: 11,
        idSender: 1,
        senderName: 'Roberto Sánchez',
        senderInitials: 'RS',
        senderColor: '#6366f1',
        senderRole: 'ADMIN',
        content: 'Bienvenidos al grupo de la Comisión del Acto del 25 de Mayo. Tenemos 3 semanas para organizar todo.',
        sentAt: hrs(7),
        status: 'READ',
        isDeleted: false
    },
    {
        idMessage: 51,
        idRoom: 11,
        idSender: 2,
        senderName: 'Ana Giménez',
        senderInitials: 'AG',
        senderColor: '#10b981',
        senderRole: 'DOCENTE',
        content: 'Propongo que cada docente se encargue de un grado para la preparación de la obra.',
        sentAt: hrs(6.8),
        status: 'READ',
        isDeleted: false
    },
    {
        idMessage: 52,
        idRoom: 11,
        idSender: 5,
        senderName: 'Mario Villalba',
        senderInitials: 'MV',
        senderColor: '#0ea5e9',
        senderRole: 'DOCENTE',
        content: 'De acuerdo. Yo me ofrezco para coordinar la parte musical.',
        sentAt: hrs(6.5),
        status: 'READ',
        isDeleted: false
    },
    {
        idMessage: 53,
        idRoom: 11,
        idSender: 6,
        senderName: 'Lucía Cabrera',
        senderInitials: 'LC',
        senderColor: '#ec4899',
        senderRole: 'DOCENTE',
        content: 'Yo me ocupo del vestuario y la escenografía.',
        sentAt: hrs(6.3),
        status: 'READ',
        isDeleted: false
    },
    {
        idMessage: 54,
        idRoom: 11,
        idSender: 1,
        senderName: 'Roberto Sánchez',
        senderInitials: 'RS',
        senderColor: '#6366f1',
        senderRole: 'ADMIN',
        content: 'Excelente. Próxima reunión presencial: lunes 3 a las 15:00 en sala de profesores.',
        sentAt: hrs(6.0),
        status: 'READ',
        isDeleted: false
    },
    {
        idMessage: 55,
        idRoom: 11,
        idSender: 2,
        senderName: 'Ana Giménez',
        senderInitials: 'AG',
        senderColor: '#10b981',
        senderRole: 'DOCENTE',
        content: '¿Tenemos presupuesto confirmado para materiales?',
        sentAt: mins(18),
        status: 'DELIVERED',
        isDeleted: false
    },

    // ── NUEVO: Grupo Equipo Pedagógico 7°B (12) ───────────────────────────────
    {
        idMessage: 56,
        idRoom: 12,
        idSender: 1,
        senderName: 'Roberto Sánchez',
        senderInitials: 'RS',
        senderColor: '#6366f1',
        senderRole: 'ADMIN',
        content: 'Creé este grupo para el seguimiento del 7°B. Hay 3 alumnos con bajo rendimiento que necesitan atención.',
        sentAt: hrs(5.5),
        status: 'READ',
        isDeleted: false
    },
    {
        idMessage: 57,
        idRoom: 12,
        idSender: 2,
        senderName: 'Ana Giménez',
        senderInitials: 'AG',
        senderColor: '#10b981',
        senderRole: 'DOCENTE',
        content: 'En Matemáticas los alumnos García, Martínez y Torres están por debajo del promedio.',
        sentAt: hrs(5.3),
        status: 'READ',
        isDeleted: false
    },
    {
        idMessage: 58,
        idRoom: 12,
        idSender: 5,
        senderName: 'Mario Villalba',
        senderInitials: 'MV',
        senderColor: '#0ea5e9',
        senderRole: 'DOCENTE',
        content: 'En Lengua también. Propongo implementar tutorías los jueves de 13 a 14hs.',
        sentAt: hrs(5.1),
        status: 'READ',
        isDeleted: false
    },
    {
        idMessage: 59,
        idRoom: 12,
        idSender: 1,
        senderName: 'Roberto Sánchez',
        senderInitials: 'RS',
        senderColor: '#6366f1',
        senderRole: 'ADMIN',
        content: 'Aprobado. ¿Quién se compromete a coordinarlas?',
        sentAt: hrs(5.0),
        status: 'READ',
        isDeleted: false
    },
    {
        idMessage: 60,
        idRoom: 12,
        idSender: 2,
        senderName: 'Ana Giménez',
        senderInitials: 'AG',
        senderColor: '#10b981',
        senderRole: 'DOCENTE',
        content: 'Yo me encargo la primera semana. Mario la segunda.',
        sentAt: mins(10),
        status: 'SENT',
        isDeleted: false
    },

    // ── NUEVO: Grupo Admin + Finanzas (13) ────────────────────────────────────
    {
        idMessage: 61,
        idRoom: 13,
        idSender: 1,
        senderName: 'Roberto Sánchez',
        senderInitials: 'RS',
        senderColor: '#6366f1',
        senderRole: 'ADMIN',
        content: 'Este grupo es para la coordinación del presupuesto del segundo semestre.',
        sentAt: hrs(4.5),
        status: 'READ',
        isDeleted: false
    },
    {
        idMessage: 62,
        idRoom: 13,
        idSender: 3,
        senderName: 'Elena Figueredo',
        senderInitials: 'EF',
        senderColor: '#f59e0b',
        senderRole: 'FINANZAS',
        content: 'Tenemos G. 45.000.000 disponibles. Propongo: 40% infraestructura, 35% material didáctico, 25% eventos.',
        sentAt: hrs(4.3),
        status: 'READ',
        isDeleted: false
    },
    {
        idMessage: 63,
        idRoom: 13,
        idSender: 9,
        senderName: 'Diego Romero',
        senderInitials: 'DR',
        senderColor: '#f97316',
        senderRole: 'FINANZAS',
        content: 'Concuerdo con la distribución. Hay que prever también el mantenimiento de equipos informáticos.',
        sentAt: hrs(4.1),
        status: 'READ',
        isDeleted: false
    },
    {
        idMessage: 64,
        idRoom: 13,
        idSender: 1,
        senderName: 'Roberto Sánchez',
        senderInitials: 'RS',
        senderColor: '#6366f1',
        senderRole: 'ADMIN',
        content: 'Buen punto Diego. Ajusten la propuesta incluyendo un 5% para TI y mándenme el borrador.',
        sentAt: hrs(4.0),
        status: 'READ',
        isDeleted: false
    },
    { idMessage: 65, idRoom: 13, idSender: 3, senderName: 'Elena Figueredo', senderInitials: 'EF', senderColor: '#f59e0b', senderRole: 'FINANZAS', content: 'Lo tenemos listo mañana a primera hora.', sentAt: mins(8), status: 'SENT', isDeleted: false }
];
