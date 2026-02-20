// src/app/core/services/conf/academic.service.ts
import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

import {
    MOCK_SCHOOL_YEARS,
    MOCK_SCHOOL_PERIODS,
    MOCK_GRADES,
    MOCK_SECTIONS,
    MOCK_SUBJECTS,
    SchoolYearMock,
    SchoolPeriodMock,
    GradeMock,
    SectionMock,
    SubjectMock,
    GradeScoreExMock,
    MOCK_GRADE_SCORES,
    ScheduleMock,
    MOCK_SCHEDULES
} from '../../../shared/data/academic.mock';

import { MOCK_STUDENTS, StudentMock } from '../../../shared/data/people.mock';

export interface GradeScoreUpsertRequest {
    idStudentEnrollment: number;
    idStudent: number;
    studentName?: string;
    idSection: number;
    idSubject: number;
    subjectName?: string;
    subjectCode?: string;
    idSchoolPeriod: number;
    schoolPeriodName?: string;
    periodNumber: number;
    score: number;
    maxScore: number;
    idTeacher?: number;
    teacherName?: string;
    observations?: string;
}

@Injectable({ providedIn: 'root' })
export class AcademicService {
    readonly DEMO_MODE = true;
    private readonly DELAY_MS = 350;

    private _scores = signal<GradeScoreExMock[]>([...MOCK_GRADE_SCORES]);
    private nextScoreId = 1000;

    // ── Datos de referencia ───────────────────────────────────────────────────

    getSchoolYears(): Observable<SchoolYearMock[]> {
        return of(MOCK_SCHOOL_YEARS).pipe(delay(this.DELAY_MS));
    }

    getPeriods(idSchoolYear?: number): Observable<SchoolPeriodMock[]> {
        const result = idSchoolYear ? MOCK_SCHOOL_PERIODS.filter((p) => p.idSchoolYear === idSchoolYear) : MOCK_SCHOOL_PERIODS;
        return of([...result].sort((a, b) => a.periodNumber - b.periodNumber)).pipe(delay(this.DELAY_MS));
    }

    getGrades(): Observable<GradeMock[]> {
        return of(MOCK_GRADES.filter((g) => g.isActive).sort((a, b) => a.gradeOrder - b.gradeOrder)).pipe(delay(this.DELAY_MS));
    }

    getSections(idGrade?: number, idSchoolYear?: number): Observable<SectionMock[]> {
        let result = MOCK_SECTIONS.filter((s) => s.isActive);
        if (idGrade) result = result.filter((s) => s.idGrade === idGrade);
        if (idSchoolYear) result = result.filter((s) => s.idSchoolYear === idSchoolYear);
        return of(result).pipe(delay(this.DELAY_MS));
    }

    getSubjects(): Observable<SubjectMock[]> {
        return of(MOCK_SUBJECTS.filter((s) => s.isActive)).pipe(delay(this.DELAY_MS));
    }

    // ── Alumnos por sección ───────────────────────────────────────────────────

    getStudentsBySection(idSection: number): Observable<StudentMock[]> {
        // En demo: filtramos por idSection en los scores existentes para obtener alumnos
        // En producción: endpoint /students?idSection=X
        const studentIds = [
            ...new Set(
                this._scores()
                    .filter((s) => s.idSection === idSection)
                    .map((s) => s.idStudent)
            )
        ];

        // Complementar con alumnos del mock general que no tengan notas aún
        const sectionStudents = MOCK_STUDENTS.filter((s) => s.isActive && s.idCurrentSection === idSection);

        // Merge: priorizar los que tienen notas, agregar los que no tienen
        const allIds = [...new Set([...studentIds, ...sectionStudents.map((s) => s.idStudent)])];
        const result = allIds
            .map((id) => MOCK_STUDENTS.find((s) => s.idStudent === id))
            .filter((s): s is StudentMock => !!s)
            .sort((a, b) => a.fullName.localeCompare(b.fullName));

        return of(result).pipe(delay(this.DELAY_MS));
    }

    // ── Calificaciones ────────────────────────────────────────────────────────

    getScoresByStudentSection(idStudent: number, idSection: number): Observable<GradeScoreExMock[]> {
        const result = this._scores().filter((s) => s.idStudent === idStudent && s.idSection === idSection && s.isActive);
        return of(result).pipe(delay(this.DELAY_MS));
    }

    // Upsert: crea o actualiza una nota
    upsertScore(req: GradeScoreUpsertRequest): Observable<GradeScoreExMock> {
        const existing = this._scores().find((s) => s.idStudent === req.idStudent && s.idSection === req.idSection && s.idSubject === req.idSubject && s.idSchoolPeriod === req.idSchoolPeriod && s.isActive);

        if (existing) {
            // Update
            this._scores.update((list) => list.map((s) => (s.idGradeScore === existing.idGradeScore ? { ...s, score: req.score, observations: req.observations, gradedAt: new Date().toISOString() } : s)));
            return of({ ...existing, score: req.score }).pipe(delay(200));
        } else {
            // Insert
            const newScore: GradeScoreExMock = {
                idGradeScore: this.nextScoreId++,
                idStudentEnrollment: req.idStudentEnrollment,
                idStudent: req.idStudent,
                studentName: req.studentName,
                idSection: req.idSection,
                idSubject: req.idSubject,
                subjectName: req.subjectName,
                subjectCode: req.subjectCode,
                idSchoolPeriod: req.idSchoolPeriod,
                schoolPeriodName: req.schoolPeriodName,
                periodNumber: req.periodNumber,
                score: req.score,
                maxScore: req.maxScore,
                idTeacher: req.idTeacher,
                teacherName: req.teacherName,
                observations: req.observations,
                gradedAt: new Date().toISOString(),
                isActive: true
            };
            this._scores.update((list) => [...list, newScore]);
            return of(newScore).pipe(delay(200));
        }
    }

    // ── Horarios ──────────────────────────────────────────────────────────────

    getSchedules(idSection?: number): Observable<ScheduleMock[]> {
        const result = idSection ? MOCK_SCHEDULES.filter((s) => s.idSection === idSection && s.isActive) : MOCK_SCHEDULES.filter((s) => s.isActive);
        return of([...result].sort((a, b) => a.dayOfWeek - b.dayOfWeek || a.startTime.localeCompare(b.startTime))).pipe(delay(this.DELAY_MS));
    }

    // ── Stats académicas ──────────────────────────────────────────────────────

    getAcademicStats(): Observable<{
        totalSections: number;
        totalStudents: number;
        totalSubjects: number;
        activePeriod: string;
        scoresLoaded: number;
        pendingScores: number;
    }> {
        const activePeriod = MOCK_SCHOOL_PERIODS.find((p) => p.isActive);
        const totalStudents = MOCK_STUDENTS.filter((s) => s.isActive).length;

        // Notas cargadas en período activo
        const scoresLoaded = activePeriod ? this._scores().filter((s) => s.idSchoolPeriod === activePeriod.idSchoolPeriod && s.isActive).length : 0;

        // Notas esperadas: alumnos × materias (estimado)
        const pendingScores = Math.max(0, totalStudents * MOCK_SUBJECTS.length - scoresLoaded);

        return of({
            totalSections: MOCK_SECTIONS.filter((s) => s.isActive).length,
            totalStudents,
            totalSubjects: MOCK_SUBJECTS.filter((s) => s.isActive).length,
            activePeriod: activePeriod?.name ?? 'Sin período activo',
            scoresLoaded,
            pendingScores
        }).pipe(delay(this.DELAY_MS));
    }
}
