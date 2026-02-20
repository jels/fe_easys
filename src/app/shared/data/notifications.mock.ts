// src/app/shared/data/notifications.mock.ts

// ── Notification Type ─────────────────────────────────────────────────────────
// Relacionado con ea_notification_types en la BD
export interface NotificationTypeMock {
    idNotificationType: number;
    idCompany: number;
    name: string;
    description?: string;
    color: string; // hex
    icon: string; // clase pi-*
    isActive: boolean;
}

export const MOCK_NOTIFICATION_TYPES: NotificationTypeMock[] = [
    { idNotificationType: 1, idCompany: 1, name: 'Eventos', description: 'Notificaciones sobre eventos y actividades del colegio', color: '#6366f1', icon: 'pi-calendar', isActive: true },
    { idNotificationType: 2, idCompany: 1, name: 'Pagos', description: 'Avisos de cuotas, vencimientos y recibos', color: '#f59e0b', icon: 'pi-credit-card', isActive: true },
    { idNotificationType: 3, idCompany: 1, name: 'Disciplina', description: 'Infracciones y sanciones de alumnos', color: '#ef4444', icon: 'pi-exclamation-triangle', isActive: true },
    { idNotificationType: 4, idCompany: 1, name: 'Académico', description: 'Notas, calificaciones y períodos académicos', color: '#10b981', icon: 'pi-book', isActive: true },
    { idNotificationType: 5, idCompany: 1, name: 'Comunicados', description: 'Mensajes generales e institucionales', color: '#3b82f6', icon: 'pi-megaphone', isActive: true }
];

// ── Notification ──────────────────────────────────────────────────────────────
// Relacionado con ea_notifications en la BD
export interface NotificationMock {
    idNotification: number;
    idCompany: number;
    idNotificationType: number;
    typeName?: string;
    typeColor?: string;
    typeIcon?: string;
    title: string;
    body: string;
    priority: string; // LOW | MEDIUM | HIGH | CRITICAL
    scope: string; // ALL | GRADE | SECTION | STUDENT | STAFF
    idTarget?: number; // id del target según scope
    targetName?: string;
    isRead: boolean;
    isSent: boolean;
    sentAt?: string;
    idCreatedByStaff?: number;
    createdByName?: string;
    isActive: boolean;
    createdAt: string;
}

export const MOCK_NOTIFICATIONS: NotificationMock[] = [
    // ── Eventos ───────────────────────────────────────────────────────────────
    {
        idNotification: 1,
        idCompany: 1,
        idNotificationType: 1,
        typeName: 'Eventos',
        typeColor: '#6366f1',
        typeIcon: 'pi-calendar',
        title: 'Acto de Inicio del Año Lectivo 2025',
        body: 'Se informa a toda la comunidad educativa que el acto de inicio del año lectivo 2025 se realizará el viernes 28 de febrero a las 08:00 hs en el Patio Central. Se solicita puntualidad.',
        priority: 'HIGH',
        scope: 'ALL',
        isRead: false,
        isSent: true,
        sentAt: '2025-02-20T08:00:00',
        idCreatedByStaff: 1,
        createdByName: 'Roberto Sánchez Duarte',
        isActive: true,
        createdAt: '2025-02-20T07:30:00'
    },
    {
        idNotification: 2,
        idCompany: 1,
        idNotificationType: 1,
        typeName: 'Eventos',
        typeColor: '#6366f1',
        typeIcon: 'pi-calendar',
        title: 'Excursión al Jardín Botánico — Recordatorio',
        body: 'Recordamos que la excursión educativa al Jardín Botánico de Asunción está programada para el 14 de marzo. El plazo de inscripción vence el 7 de marzo. El costo es de Gs. 50.000 por alumno.',
        priority: 'MEDIUM',
        scope: 'GRADE',
        targetName: 'EEB',
        isRead: true,
        isSent: true,
        sentAt: '2025-02-18T09:00:00',
        idCreatedByStaff: 5,
        createdByName: 'Ana Giménez Rojas',
        isActive: true,
        createdAt: '2025-02-18T08:45:00'
    },
    {
        idNotification: 3,
        idCompany: 1,
        idNotificationType: 1,
        typeName: 'Eventos',
        typeColor: '#6366f1',
        typeIcon: 'pi-calendar',
        title: 'Reunión de Padres — Inicio de Año',
        body: 'Se convoca a todos los padres y tutores a la reunión informativa del inicio del año lectivo 2025 el día viernes 21 de febrero a las 18:00 hs en el Salón de Actos.',
        priority: 'HIGH',
        scope: 'ALL',
        isRead: false,
        isSent: true,
        sentAt: '2025-02-15T10:00:00',
        idCreatedByStaff: 1,
        createdByName: 'Roberto Sánchez Duarte',
        isActive: true,
        createdAt: '2025-02-15T09:30:00'
    },

    // ── Pagos ─────────────────────────────────────────────────────────────────
    {
        idNotification: 4,
        idCompany: 1,
        idNotificationType: 2,
        typeName: 'Pagos',
        typeColor: '#f59e0b',
        typeIcon: 'pi-credit-card',
        title: 'Vencimiento de cuota — Febrero 2025',
        body: 'Le informamos que la cuota de febrero vence el 28 de febrero de 2025. Recuerde que pasada la fecha se aplicará un recargo del 2% mensual. Puede abonar en secretaría o mediante transferencia bancaria.',
        priority: 'HIGH',
        scope: 'ALL',
        isRead: false,
        isSent: true,
        sentAt: '2025-02-19T07:00:00',
        idCreatedByStaff: 2,
        createdByName: 'Elena Figueredo Páez',
        isActive: true,
        createdAt: '2025-02-19T06:50:00'
    },
    {
        idNotification: 5,
        idCompany: 1,
        idNotificationType: 2,
        typeName: 'Pagos',
        typeColor: '#f59e0b',
        typeIcon: 'pi-credit-card',
        title: 'Recibo de pago emitido',
        body: 'Se ha registrado su pago de la cuota de enero 2025 por Gs. 350.000. El recibo N° REC-0021 está disponible para descargar desde la plataforma.',
        priority: 'LOW',
        scope: 'STUDENT',
        idTarget: 1,
        targetName: 'Sofía Martínez López',
        isRead: true,
        isSent: true,
        sentAt: '2025-02-10T14:30:00',
        idCreatedByStaff: 2,
        createdByName: 'Elena Figueredo Páez',
        isActive: true,
        createdAt: '2025-02-10T14:25:00'
    },
    {
        idNotification: 6,
        idCompany: 1,
        idNotificationType: 2,
        typeName: 'Pagos',
        typeColor: '#f59e0b',
        typeIcon: 'pi-credit-card',
        title: 'Cuota vencida — Enero 2025',
        body: 'Registramos que la cuota de enero 2025 se encuentra vencida. Le solicitamos regularizar su situación a la brevedad para evitar inconvenientes.',
        priority: 'CRITICAL',
        scope: 'STUDENT',
        idTarget: 14,
        targetName: 'Franco Britez Zárate',
        isRead: false,
        isSent: true,
        sentAt: '2025-02-05T08:00:00',
        idCreatedByStaff: 2,
        createdByName: 'Elena Figueredo Páez',
        isActive: true,
        createdAt: '2025-02-05T07:55:00'
    },

    // ── Disciplina ────────────────────────────────────────────────────────────
    {
        idNotification: 7,
        idCompany: 1,
        idNotificationType: 3,
        typeName: 'Disciplina',
        typeColor: '#ef4444',
        typeIcon: 'pi-exclamation-triangle',
        title: 'Infracción registrada — Lucas González Benítez',
        body: 'Se informa que el alumno Lucas González Benítez (9° Grado A) registró una llegada tardía el día 19/02/2025. Se aplicó advertencia verbal. Por favor tome conocimiento de la situación.',
        priority: 'MEDIUM',
        scope: 'STUDENT',
        idTarget: 2,
        targetName: 'Lucas González Benítez',
        isRead: false,
        isSent: true,
        sentAt: '2025-02-19T07:40:00',
        idCreatedByStaff: 3,
        createdByName: 'Carlos Benítez Coronel',
        isActive: true,
        createdAt: '2025-02-19T07:38:00'
    },
    {
        idNotification: 8,
        idCompany: 1,
        idNotificationType: 3,
        typeName: 'Disciplina',
        typeColor: '#ef4444',
        typeIcon: 'pi-exclamation-triangle',
        title: 'Citación urgente — Franco Britez Zárate',
        body: 'Se cita urgentemente a los padres o tutores del alumno Franco Britez Zárate (8° Grado B) por incidente de mal comportamiento en clase. Por favor comunicarse con dirección a la brevedad.',
        priority: 'CRITICAL',
        scope: 'STUDENT',
        idTarget: 14,
        targetName: 'Franco Britez Zárate',
        isRead: false,
        isSent: true,
        sentAt: '2025-02-14T13:00:00',
        idCreatedByStaff: 5,
        createdByName: 'Ana Giménez Rojas',
        isActive: true,
        createdAt: '2025-02-14T12:55:00'
    },

    // ── Académico ─────────────────────────────────────────────────────────────
    {
        idNotification: 9,
        idCompany: 1,
        idNotificationType: 4,
        typeName: 'Académico',
        typeColor: '#10b981',
        typeIcon: 'pi-book',
        title: 'Inicio del 1er Bimestre 2025',
        body: 'Se comunica que el primer bimestre del año lectivo 2025 comienza el lunes 3 de marzo. Las evaluaciones bimestrales se realizarán del 24 al 28 de marzo. Se recomienda preparación con anticipación.',
        priority: 'MEDIUM',
        scope: 'ALL',
        isRead: true,
        isSent: true,
        sentAt: '2025-02-28T07:00:00',
        idCreatedByStaff: 1,
        createdByName: 'Roberto Sánchez Duarte',
        isActive: true,
        createdAt: '2025-02-27T16:00:00'
    },
    {
        idNotification: 10,
        idCompany: 1,
        idNotificationType: 4,
        typeName: 'Académico',
        typeColor: '#10b981',
        typeIcon: 'pi-book',
        title: 'Calificaciones disponibles — 1er Bimestre',
        body: 'Las calificaciones del primer bimestre ya están disponibles en la plataforma. Los promedios y el boletín pueden consultarse desde la sección Académico. Ante cualquier consulta comunicarse con el docente responsable.',
        priority: 'MEDIUM',
        scope: 'ALL',
        isRead: false,
        isSent: true,
        sentAt: '2025-04-02T10:00:00',
        idCreatedByStaff: 1,
        createdByName: 'Roberto Sánchez Duarte',
        isActive: true,
        createdAt: '2025-04-02T09:45:00'
    },

    // ── Comunicados ───────────────────────────────────────────────────────────
    {
        idNotification: 11,
        idCompany: 1,
        idNotificationType: 5,
        typeName: 'Comunicados',
        typeColor: '#3b82f6',
        typeIcon: 'pi-megaphone',
        title: 'Bienvenida al Año Lectivo 2025',
        body: 'La dirección del Colegio San José da la bienvenida a toda la comunidad educativa al año lectivo 2025. Esperamos que sea un año de mucho aprendizaje y crecimiento para todos nuestros alumnos.',
        priority: 'LOW',
        scope: 'ALL',
        isRead: true,
        isSent: true,
        sentAt: '2025-02-03T08:00:00',
        idCreatedByStaff: 1,
        createdByName: 'Roberto Sánchez Duarte',
        isActive: true,
        createdAt: '2025-02-03T07:45:00'
    },
    {
        idNotification: 12,
        idCompany: 1,
        idNotificationType: 5,
        typeName: 'Comunicados',
        typeColor: '#3b82f6',
        typeIcon: 'pi-megaphone',
        title: 'Actualización del reglamento interno 2025',
        body: 'Se pone en conocimiento de toda la comunidad educativa que el reglamento interno del colegio ha sido actualizado para el año 2025. El documento completo está disponible en secretaría y en la plataforma digital.',
        priority: 'MEDIUM',
        scope: 'ALL',
        isRead: false,
        isSent: false,
        idCreatedByStaff: 1,
        createdByName: 'Roberto Sánchez Duarte',
        isActive: true,
        createdAt: '2025-02-19T11:00:00'
    }
];
