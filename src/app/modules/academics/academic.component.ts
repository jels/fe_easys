// src/app/modules/academic/academic.component.ts

import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TabsModule } from 'primeng/tabs';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { AcademicsService } from '../../core/services/api/academics.service';
import { AuthService } from '../../core/services/api/auth.service';
import { GradeResponse, SectionResponse, SubjectResponse, SchoolPeriodResponse, SchoolYearResponse, ClassScheduleResponse, GradeScoreResponse, AcademicStatsResponse, UpsertGradeScoreRequest } from '../../core/models/academic.models';
import { StudentResponse } from '../../core/models/student.dto';

// ── Estructura interna para la grilla de notas ────────────────────────────────

interface ScoreCell {
    score: number | null;
    idGradeScore?: number;
    editing: boolean;
    saving: boolean;
    tempValue: number | null;
}

interface SubjectRow {
    idSubject: number;
    subjectName: string;
    subjectCode: string;
    cells: Map<number, ScoreCell>; // key = idSchoolPeriod
    yearAvg: number | null;
    failedLastPeriod: boolean;
    failedYearAvg: boolean;
}

interface StudentGradeGrid {
    student: StudentResponse;
    idEnrollment: number | null; // idStudentEnrollment del backend
    rows: SubjectRow[];
    periodAvgs: Map<number, number | null>;
    generalAvg: number | null;
    expanded: boolean;
    isReprobado: boolean;
    failedSubjects: string[];
}

@Component({
    selector: 'app-academic',
    standalone: true,
    imports: [CommonModule, FormsModule, SelectModule, TabsModule, TableModule, TagModule, ButtonModule, SkeletonModule, TooltipModule, ToastModule, InputNumberModule],
    templateUrl: './academic.component.html',
    styleUrl: './academic.component.scss',
    providers: [MessageService]
})
export class AcademicComponent implements OnInit, OnDestroy {
    activeTab = signal('0');

    // ── Datos de referencia ───────────────────────────────────────────────────
    grades = signal<GradeResponse[]>([]);
    sections = signal<SectionResponse[]>([]);
    allSections = signal<SectionResponse[]>([]); // para Tab horarios
    subjects = signal<SubjectResponse[]>([]);
    periods = signal<SchoolPeriodResponse[]>([]);
    schoolYears = signal<SchoolYearResponse[]>([]);
    schedules = signal<ClassScheduleResponse[]>([]);
    stats = signal<AcademicStatsResponse | null>(null);

    // ── Selectores Tab 1 ──────────────────────────────────────────────────────
    selectedGrade: GradeResponse | null = null;
    selectedSection: SectionResponse | null = null;

    // ── Estado Tab 1 ──────────────────────────────────────────────────────────
    sectionStudents = signal<StudentResponse[]>([]);
    gradeGrids = signal<StudentGradeGrid[]>([]);
    loadingStudents = signal(false);
    loadingScores = signal<Record<number, boolean>>({});

    // ── Estado Tab 3 (Horarios) ───────────────────────────────────────────────
    selectedSectionSchedule: SectionResponse | null = null;
    loadingSchedules = signal(false);

    readonly DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

    private destroy$ = new Subject<void>();

    constructor(
        private academicService: AcademicsService,
        private authService: AuthService,
        private messageService: MessageService
    ) {}

    ngOnInit(): void {
        this.loadReferenceData();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    // ── Carga de datos de referencia ──────────────────────────────────────────

    loadReferenceData(): void {
        const idCompany = this.authService.idCompany;
        if (!idCompany) return;

        // Grados
        this.academicService
            .getGrades(idCompany)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res) => {
                    if (res.success) this.grades.set(res.data ?? []);
                }
            });

        // Materias
        this.academicService
            .getSubjects(idCompany)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res) => {
                    if (res.success) this.subjects.set(res.data ?? []);
                }
            });

        // Períodos del año activo — primero cargamos años, luego períodos del activo
        this.academicService
            .getSchoolYears(idCompany)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res) => {
                    if (res.success && res.data) {
                        this.schoolYears.set(res.data);
                        const activeYear = res.data.find((y) => y.isActive);
                        if (activeYear) {
                            this.loadPeriods(activeYear.idSchoolYear);
                        }
                    }
                }
            });

        // Todas las secciones (para Tab horarios)
        this.academicService
            .getSections(idCompany)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res) => {
                    if (res.success) this.allSections.set(res.data ?? []);
                }
            });

        // Stats académicas
        this.academicService
            .getStats(idCompany)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res) => {
                    if (res.success) this.stats.set(res.data ?? null);
                }
            });
    }

    private loadPeriods(idSchoolYear: number): void {
        this.academicService
            .getPeriods(idSchoolYear)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res) => {
                    if (res.success) this.periods.set(res.data ?? []);
                }
            });
    }

    // ── Tab 1: Notas ──────────────────────────────────────────────────────────

    onGradeChange(): void {
        this.selectedSection = null;
        this.sections.set([]);
        this.sectionStudents.set([]);
        this.gradeGrids.set([]);
        if (!this.selectedGrade) return;

        const idCompany = this.authService.idCompany;
        if (!idCompany) return;

        this.academicService
            .getSections(idCompany, { idGrade: this.selectedGrade.idGrade })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res) => {
                    if (res.success) this.sections.set(res.data ?? []);
                }
            });
    }

    onSectionChange(): void {
        this.sectionStudents.set([]);
        this.gradeGrids.set([]);
        if (!this.selectedSection) return;
        this.loadSectionStudents();
    }

    loadSectionStudents(): void {
        if (!this.selectedSection) return;
        this.loadingStudents.set(true);

        this.academicService
            .getStudentsBySection(this.selectedSection.idSection)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res) => {
                    const students = res.success ? (res.data ?? []) : [];
                    this.sectionStudents.set(students);

                    const grids: StudentGradeGrid[] = students.map((s) => ({
                        student: s,
                        idEnrollment: null,
                        rows: [],
                        periodAvgs: new Map(),
                        generalAvg: null,
                        expanded: false,
                        isReprobado: false,
                        failedSubjects: []
                    }));
                    this.gradeGrids.set(grids);
                    this.loadingStudents.set(false);
                },
                error: () => this.loadingStudents.set(false)
            });
    }

    toggleStudentExpansion(grid: StudentGradeGrid): void {
        if (!grid.expanded && grid.rows.length === 0) {
            this.loadStudentScores(grid);
        }
        grid.expanded = !grid.expanded;
        this.gradeGrids.update((list) => [...list]);
    }

    loadStudentScores(grid: StudentGradeGrid): void {
        if (!this.selectedSection) return;
        const idStudent = grid.student.idStudent;

        this.loadingScores.update((s) => ({ ...s, [idStudent]: true }));

        // El backend devuelve las notas de la sección completa —
        // filtramos por alumno después de recibirlas
        this.academicService
            .getScoresBySection(this.selectedSection.idSection)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res) => {
                    const allScores = res.success ? (res.data ?? []) : [];
                    // Filtrar solo las notas del alumno específico
                    const studentScores = allScores.filter((s) => s.idStudent === idStudent);
                    grid.rows = this.buildSubjectRows(studentScores);
                    this.recalcAverages(grid);
                    this.loadingScores.update((s) => ({ ...s, [idStudent]: false }));
                    this.gradeGrids.update((list) => [...list]);
                },
                error: () => {
                    this.loadingScores.update((s) => ({ ...s, [idStudent]: false }));
                }
            });
    }

    private buildSubjectRows(scores: GradeScoreResponse[]): SubjectRow[] {
        const allSubjects = this.subjects();
        const rows: SubjectRow[] = [];

        for (const subject of allSubjects) {
            const cells = new Map<number, ScoreCell>();

            for (const period of this.periods()) {
                const existing = scores.find((s) => s.idSubject === subject.idSubject && s.idSchoolPeriod === period.idSchoolPeriod);
                cells.set(period.idSchoolPeriod, {
                    score: existing?.score ?? null,
                    idGradeScore: existing?.idGradeScore,
                    editing: false,
                    saving: false,
                    tempValue: existing?.score ?? null
                });
            }

            rows.push({
                idSubject: subject.idSubject,
                subjectName: subject.name,
                subjectCode: subject.code,
                cells,
                yearAvg: null,
                failedLastPeriod: false,
                failedYearAvg: false
            });
        }

        return rows;
    }

    private recalcAverages(grid: StudentGradeGrid): void {
        const periods = this.periods();
        const lastPeriod = periods.length > 0 ? periods.reduce((a, b) => (b.periodNumber > a.periodNumber ? b : a)) : null;

        for (const row of grid.rows) {
            const scores: number[] = [];
            for (const period of periods) {
                const cell = row.cells.get(period.idSchoolPeriod);
                if (cell?.score !== null && cell?.score !== undefined) {
                    scores.push(cell.score);
                }
            }
            row.yearAvg = scores.length > 0 ? this.round2(scores.reduce((a, b) => a + b, 0) / scores.length) : null;

            const lastCell = lastPeriod ? row.cells.get(lastPeriod.idSchoolPeriod) : null;
            row.failedLastPeriod = lastCell?.score === 1;
            row.failedYearAvg = row.yearAvg !== null && row.yearAvg < 2;
        }

        grid.periodAvgs = new Map();
        for (const period of periods) {
            const periodScores: number[] = [];
            for (const row of grid.rows) {
                const cell = row.cells.get(period.idSchoolPeriod);
                if (cell?.score !== null && cell?.score !== undefined) {
                    periodScores.push(cell.score);
                }
            }
            grid.periodAvgs.set(period.idSchoolPeriod, periodScores.length > 0 ? this.round2(periodScores.reduce((a, b) => a + b, 0) / periodScores.length) : null);
        }

        const yearAvgs = grid.rows.map((r) => r.yearAvg).filter((v): v is number => v !== null);

        grid.generalAvg = yearAvgs.length > 0 ? this.round2(yearAvgs.reduce((a, b) => a + b, 0) / yearAvgs.length) : null;

        const failedRows = grid.rows.filter((r) => r.failedLastPeriod || r.failedYearAvg);
        grid.failedSubjects = failedRows.map((r) => r.subjectName);
        grid.isReprobado = failedRows.length > 0;
    }

    // ── Edición inline de notas ───────────────────────────────────────────────

    startEdit(cell: ScoreCell): void {
        cell.tempValue = cell.score;
        cell.editing = true;
    }

    cancelEdit(cell: ScoreCell): void {
        cell.tempValue = cell.score;
        cell.editing = false;
    }

    saveScore(grid: StudentGradeGrid, row: SubjectRow, period: SchoolPeriodResponse, cell: ScoreCell): void {
        if (cell.tempValue === null || cell.tempValue === undefined) {
            cell.editing = false;
            return;
        }

        const score = Math.min(Math.max(cell.tempValue, 0), 10);
        cell.saving = true;
        cell.editing = false;

        // El backend requiere idStudentEnrollment — si aún no lo tenemos en el grid
        // usamos el idStudent como fallback (el backend lo resuelve via @Query)
        const request: UpsertGradeScoreRequest = {
            idStudentEnrollment: grid.idEnrollment ?? grid.student.idStudent,
            idSubject: row.idSubject,
            idSchoolPeriod: period.idSchoolPeriod,
            score,
            maxScore: 10
        };

        this.academicService
            .upsertScore(request)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res) => {
                    if (res.success && res.data) {
                        cell.score = res.data.score;
                        cell.idGradeScore = res.data.idGradeScore;
                        cell.tempValue = res.data.score;
                        // Guardar idEnrollment para usos futuros
                        if (!grid.idEnrollment) {
                            grid.idEnrollment = res.data.idStudentEnrollment;
                        }
                    }
                    cell.saving = false;
                    this.recalcAverages(grid);
                    this.gradeGrids.update((l) => [...l]);
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Nota guardada',
                        detail: `${row.subjectName} — ${period.name}`,
                        life: 2000
                    });
                },
                error: () => {
                    cell.saving = false;
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error al guardar'
                    });
                }
            });
    }

    onScoreKeydown(event: KeyboardEvent, grid: StudentGradeGrid, row: SubjectRow, period: SchoolPeriodResponse, cell: ScoreCell): void {
        if (event.key === 'Enter') this.saveScore(grid, row, period, cell);
        if (event.key === 'Escape') this.cancelEdit(cell);
    }

    // ── Tab 3: Horarios ───────────────────────────────────────────────────────

    onSectionScheduleChange(): void {
        if (!this.selectedSectionSchedule) {
            this.schedules.set([]);
            return;
        }
        this.loadingSchedules.set(true);
        this.academicService
            .getSchedulesBySection(this.selectedSectionSchedule.idSection)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (res) => {
                    this.schedules.set(res.success ? (res.data ?? []) : []);
                    this.loadingSchedules.set(false);
                },
                error: () => this.loadingSchedules.set(false)
            });
    }

    getScheduleForSlot(day: string, time: string): ClassScheduleResponse | undefined {
        return this.schedules().find((s) => s.dayName === day && s.startTime === time);
    }

    get uniqueTimeSlots(): string[] {
        return [...new Set(this.schedules().map((s) => s.startTime))].sort();
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    round2(n: number): number {
        return Math.round(n * 100) / 100;
    }

    getScoreColor(score: number | null): string {
        if (score === null) return '';
        if (score >= 9) return 'score-excellent';
        if (score >= 7) return 'score-good';
        if (score >= 5) return 'score-regular';
        return 'score-fail';
    }

    getLevelLabel(level: string): string {
        const map: Record<string, string> = {
            INICIAL: 'Inicial',
            EEB: 'EEB',
            MEDIA: 'Media'
        };
        return map[level] ?? level;
    }

    getLevelSeverity(level: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
        const map: Record<string, 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast'> = {
            INICIAL: 'success',
            EEB: 'info',
            MEDIA: 'warn'
        };
        return map[level] ?? 'secondary';
    }

    get gradeOptions(): { label: string; value: GradeResponse }[] {
        return this.grades().map((g) => ({
            label: `${g.name} (${this.getLevelLabel(g.level)})`,
            value: g
        }));
    }

    get sectionOptions(): { label: string; value: SectionResponse }[] {
        return this.sections().map((s) => ({
            label: `${s.gradeName} ${s.name} — ${s.homeroomTeacherName ?? 'Sin tutor'}`,
            value: s
        }));
    }

    get allSectionOptions(): { label: string; value: SectionResponse }[] {
        return this.allSections().map((s) => ({
            label: `${s.gradeName} ${s.name}`,
            value: s
        }));
    }

    getGradeLevel(idGrade: number): string | null {
        return this.grades().find((g) => g.idGrade === idGrade)?.level ?? null;
    }

    // fullName helper — StudentResponse tiene person.fullName
    getStudentName(student: StudentResponse): string {
        return student.person?.fullName ?? '';
    }

    getStudentInitial(student: StudentResponse): string {
        return student.person?.firstName?.charAt(0) ?? '?';
    }
}
