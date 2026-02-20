// src/app/modules/academic/academic.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, signal, computed } from '@angular/core';
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

import { AcademicService } from '../../core/services/conf/academic.service';
import { MOCK_SCHOOL_YEARS, MOCK_SCHOOL_PERIODS, MOCK_GRADES, MOCK_SECTIONS, MOCK_SUBJECTS, SchoolYearMock, SchoolPeriodMock, GradeMock, SectionMock, SubjectMock, ScheduleMock, GradeScoreExMock } from '../../shared/data/academic.mock';
import { StudentMock } from '../../shared/data/people.mock';

// ── Estructura interna para la grilla de notas ────────────────────────────────
interface ScoreCell {
    score: number | null; // null = sin nota
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
    failedLastPeriod: boolean; // nota 1 en el último período
    failedYearAvg: boolean; // promedio año < 2
}

interface StudentGradeGrid {
    student: StudentMock;
    rows: SubjectRow[];
    periodAvgs: Map<number, number | null>; // key = idSchoolPeriod
    generalAvg: number | null;
    expanded: boolean;
    isReprobado: boolean; // true si alguna condición de reprobación se cumple
    failedSubjects: string[]; // nombres de materias reprobadas
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
    grades = signal<GradeMock[]>([]);
    sections = signal<SectionMock[]>([]);
    subjects = signal<SubjectMock[]>([]);
    periods = signal<SchoolPeriodMock[]>([]);
    schoolYears = signal<SchoolYearMock[]>([]);
    schedules = signal<ScheduleMock[]>([]);
    stats = signal<any>(null);

    // ── Selectores Tab 1 ─────────────────────────────────────────────────────
    selectedGrade: GradeMock | null = null;
    selectedSection: SectionMock | null = null;

    // ── Estado Tab 1 ─────────────────────────────────────────────────────────
    sectionStudents = signal<StudentMock[]>([]);
    gradeGrids = signal<StudentGradeGrid[]>([]);
    loadingStudents = signal(false);
    loadingScores = signal<Record<number, boolean>>({});

    // ── Estado Tab 3 (Horarios) ───────────────────────────────────────────────
    selectedSectionSchedule: SectionMock | null = null;
    loadingSchedules = signal(false);

    readonly DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

    private destroy$ = new Subject<void>();

    constructor(
        private academicService: AcademicService,
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
        this.academicService
            .getGrades()
            .pipe(takeUntil(this.destroy$))
            .subscribe((g) => this.grades.set(g));

        this.academicService
            .getSubjects()
            .pipe(takeUntil(this.destroy$))
            .subscribe((s) => this.subjects.set(s));

        this.academicService
            .getPeriods(1) // Año lectivo activo
            .pipe(takeUntil(this.destroy$))
            .subscribe((p) => this.periods.set(p));

        this.academicService
            .getSchoolYears()
            .pipe(takeUntil(this.destroy$))
            .subscribe((y) => this.schoolYears.set(y));

        this.academicService
            .getAcademicStats()
            .pipe(takeUntil(this.destroy$))
            .subscribe((s) => this.stats.set(s));
    }

    // ── Tab 1: Notas ──────────────────────────────────────────────────────────

    onGradeChange(): void {
        this.selectedSection = null;
        this.sections.set([]);
        this.sectionStudents.set([]);
        this.gradeGrids.set([]);

        if (!this.selectedGrade) return;

        this.academicService
            .getSections(this.selectedGrade.idGrade, 1)
            .pipe(takeUntil(this.destroy$))
            .subscribe((s) => this.sections.set(s));
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
            .subscribe((students) => {
                this.sectionStudents.set(students);
                // Inicializar grids vacíos para cada alumno
                const grids: StudentGradeGrid[] = students.map((s) => ({
                    student: s,
                    rows: [],
                    periodAvgs: new Map(),
                    generalAvg: null,
                    expanded: false,
                    isReprobado: false,
                    failedSubjects: []
                }));
                this.gradeGrids.set(grids);
                this.loadingStudents.set(false);
            });
    }

    toggleStudentExpansion(grid: StudentGradeGrid): void {
        if (!grid.expanded) {
            // Primera vez que se expande → cargar notas
            if (grid.rows.length === 0) {
                this.loadStudentScores(grid);
            }
            grid.expanded = true;
        } else {
            grid.expanded = false;
        }
        this.gradeGrids.update((list) => [...list]);
    }

    loadStudentScores(grid: StudentGradeGrid): void {
        const idStudent = grid.student.idStudent;
        const idSection = this.selectedSection!.idSection;

        this.loadingScores.update((s) => ({ ...s, [idStudent]: true }));

        this.academicService
            .getScoresByStudentSection(idStudent, idSection)
            .pipe(takeUntil(this.destroy$))
            .subscribe((scores) => {
                grid.rows = this.buildSubjectRows(scores);
                this.recalcAverages(grid);
                this.loadingScores.update((s) => ({ ...s, [idStudent]: false }));
                this.gradeGrids.update((list) => [...list]);
            });
    }

    private buildSubjectRows(scores: GradeScoreExMock[]): SubjectRow[] {
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

        // Último período con número de período mayor
        const lastPeriod = periods.length > 0 ? periods.reduce((a, b) => (b.periodNumber > a.periodNumber ? b : a)) : null;

        // Promedio año por materia + flags de reprobación
        for (const row of grid.rows) {
            const scores: number[] = [];
            for (const period of periods) {
                const cell = row.cells.get(period.idSchoolPeriod);
                if (cell?.score !== null && cell?.score !== undefined) {
                    scores.push(cell.score);
                }
            }
            row.yearAvg = scores.length > 0 ? this.round2(scores.reduce((a, b) => a + b, 0) / scores.length) : null;

            // Regla 1: nota 1 en el último período
            const lastCell = lastPeriod ? row.cells.get(lastPeriod.idSchoolPeriod) : null;
            row.failedLastPeriod = lastCell?.score === 1;

            // Regla 2: promedio año < 2
            row.failedYearAvg = row.yearAvg !== null && row.yearAvg < 2;
        }

        // Promedio por período
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

        // Promedio general
        const yearAvgs = grid.rows.map((r) => r.yearAvg).filter((v): v is number => v !== null);

        grid.generalAvg = yearAvgs.length > 0 ? this.round2(yearAvgs.reduce((a, b) => a + b, 0) / yearAvgs.length) : null;

        // Calcular estado de reprobación del alumno
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

    saveScore(grid: StudentGradeGrid, row: SubjectRow, period: SchoolPeriodMock, cell: ScoreCell): void {
        if (cell.tempValue === null || cell.tempValue === undefined) {
            cell.editing = false;
            return;
        }

        const score = Math.min(Math.max(cell.tempValue, 0), row.cells.get(period.idSchoolPeriod)?.score ?? 10);
        cell.saving = true;
        cell.editing = false;

        const subject = this.subjects().find((s) => s.idSubject === row.idSubject);

        this.academicService
            .upsertScore({
                idStudentEnrollment: grid.student.idStudent, // en demo = idStudent
                idStudent: grid.student.idStudent,
                studentName: grid.student.fullName,
                idSection: this.selectedSection!.idSection,
                idSubject: row.idSubject,
                subjectName: row.subjectName,
                subjectCode: row.subjectCode,
                idSchoolPeriod: period.idSchoolPeriod,
                schoolPeriodName: period.name,
                periodNumber: period.periodNumber,
                score,
                maxScore: 10
            })
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (saved) => {
                    cell.score = saved.score;
                    cell.idGradeScore = saved.idGradeScore;
                    cell.tempValue = saved.score;
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
                    this.messageService.add({ severity: 'error', summary: 'Error al guardar' });
                }
            });
    }

    onScoreKeydown(event: KeyboardEvent, grid: StudentGradeGrid, row: SubjectRow, period: SchoolPeriodMock, cell: ScoreCell): void {
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
            .getSchedules(this.selectedSectionSchedule.idSection)
            .pipe(takeUntil(this.destroy$))
            .subscribe((s) => {
                this.schedules.set(s);
                this.loadingSchedules.set(false);
            });
    }

    getScheduleForSlot(day: string, time: string): ScheduleMock | undefined {
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
        const map: Record<string, string> = { INICIAL: 'Inicial', EEB: 'EEB', MEDIA: 'Media' };
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

    get gradeOptions(): { label: string; value: GradeMock }[] {
        return this.grades().map((g) => ({ label: `${g.name} (${this.getLevelLabel(g.level)})`, value: g }));
    }

    get sectionOptions(): { label: string; value: SectionMock }[] {
        return this.sections().map((s) => ({
            label: `${s.gradeName} ${s.name} — ${s.homeroomTeacherName ?? 'Sin tutor'}`,
            value: s
        }));
    }

    get allSectionOptions(): { label: string; value: SectionMock }[] {
        return MOCK_SECTIONS.filter((s) => s.isActive).map((s) => ({ label: `${s.gradeName} ${s.name}`, value: s }));
    }

    get allSections(): SectionMock[] {
        return MOCK_SECTIONS.filter((s) => s.isActive);
    }

    getGradeLevel(idGrade: number): string | null {
        return this.grades().find((g) => g.idGrade === idGrade)?.level ?? null;
    }
}
