// src/app/core/models/dashboard.models.ts

export interface DashboardStatsResponse {
    // ── Personas ──────────────────────────────────────────────────────────────
    totalStudents: number;
    activeStudents: number;
    totalStaff: number;
    totalParents: number;

    // ── Asistencia del día ────────────────────────────────────────────────────
    presentToday: number;
    absentToday: number;
    lateToday: number;
    earlyDeparturesToday: number;
    attendanceRate: number; // porcentaje 0-100

    // ── Académico ─────────────────────────────────────────────────────────────
    activeYear: string;
    activePeriod: string;
    totalSections: number;
    totalSubjects: number;

    // ── Financiero ────────────────────────────────────────────────────────────
    collectedThisMonth: number;
    pendingAmount: number;
    overdueAmount: number;
    overdueCount: number;

    // ── Operaciones ───────────────────────────────────────────────────────────
    criticalInfractions: number;
    pendingNotifications: number;
    upcomingEvents: number;

    // ── QR ────────────────────────────────────────────────────────────────────
    qrEntradasToday: number;
    qrSalidasToday: number;
    studentsInsideNow: number;

    // ── Charts ────────────────────────────────────────────────────────────────
    attendanceLast7Days: AttendanceChartPoint[];
    paymentLast6Months: PaymentChartPoint[];
    studentsByGrade: NameValuePoint[];
    infractionsBySeverity: NameValuePoint[];
}

export interface AttendanceChartPoint {
    date: string; // yyyy-MM-dd
    present: number;
    absent: number;
    late: number;
}

export interface PaymentChartPoint {
    month: string; // yyyy-MM
    collected: number;
    pending: number;
}

export interface NameValuePoint {
    name: string;
    value: number;
}

// ── Compatibilidad con el mock anterior ──────────────────────────────────────
// DashboardStats era la interfaz del mock — los componentes que la usen
// pueden mapear desde DashboardStatsResponse

export interface DashboardStats {
    students: { total: number; active: number; newThisMonth: number };
    staff: { total: number; active: number };
    sections: { total: number };
    payments: { pendingCount: number; overdueCount: number };
    access: { presentToday: number; absentToday: number; lateToday: number };
    infractions: { openCount: number; criticalCount: number };
    activePeriod: string;
    activeYear: string;
}

/** Convierte DashboardStatsResponse del backend al formato legacy DashboardStats */
export function tolegacyStats(r: DashboardStatsResponse): DashboardStats {
    return {
        students: { total: r.totalStudents, active: r.activeStudents, newThisMonth: 0 },
        staff: { total: r.totalStaff, active: r.totalStaff },
        sections: { total: r.totalSections },
        payments: { pendingCount: 0, overdueCount: r.overdueCount },
        access: { presentToday: r.presentToday, absentToday: r.absentToday, lateToday: r.lateToday },
        infractions: { openCount: r.criticalInfractions, criticalCount: r.criticalInfractions },
        activePeriod: r.activePeriod,
        activeYear: r.activeYear
    };
}
