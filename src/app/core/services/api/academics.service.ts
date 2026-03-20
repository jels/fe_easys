// src/app/core/services/api/academics.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../models/auth.models';
import {
    GradeResponse,
    SectionResponse,
    SubjectResponse,
    SchoolYearResponse,
    SchoolPeriodResponse,
    ClassScheduleResponse,
    GradeScoreResponse,
    AcademicStatsResponse,
    CreateGradeRequest,
    CreateSectionRequest,
    CreateSubjectRequest,
    UpsertClassScheduleRequest,
    EnrollStudentRequest,
    UpsertGradeScoreRequest,
    SectionFilter,
    ScheduleFilter
} from '../../models/academic.models';
import { StudentResponse } from '../../models/student.dto';

@Injectable({ providedIn: 'root' })
export class AcademicsService {
    private readonly API = `${environment.apiUrl}academic`;

    constructor(private http: HttpClient) {}

    // ── School Years ──────────────────────────────────────────────────────────
    // GET /api/v1/academic/school-years?idCompany=

    getSchoolYears(idCompany: number): Observable<ApiResponse<SchoolYearResponse[]>> {
        const params = new HttpParams().set('idCompany', idCompany);
        return this.http.get<ApiResponse<SchoolYearResponse[]>>(`${this.API}/school-years`, { params });
    }

    // GET /api/v1/settings/school-years/{idSchoolYear}  (con períodos incluidos)

    getSchoolYearWithPeriods(idSchoolYear: number): Observable<ApiResponse<SchoolYearResponse>> {
        return this.http.get<ApiResponse<SchoolYearResponse>>(`${environment.apiUrl}settings/school-years/${idSchoolYear}`);
    }

    // ── School Periods ────────────────────────────────────────────────────────
    // GET /api/v1/settings/school-years/{idSchoolYear}/periods

    getPeriods(idSchoolYear: number): Observable<ApiResponse<SchoolPeriodResponse[]>> {
        return this.http.get<ApiResponse<SchoolPeriodResponse[]>>(`${environment.apiUrl}settings/school-years/${idSchoolYear}/periods`);
    }

    // ── Grades ────────────────────────────────────────────────────────────────
    // GET /api/v1/academic/grades?idCompany=&level=

    getGrades(idCompany: number, level?: string): Observable<ApiResponse<GradeResponse[]>> {
        let params = new HttpParams().set('idCompany', idCompany);
        if (level) params = params.set('level', level);
        return this.http.get<ApiResponse<GradeResponse[]>>(`${this.API}/grades`, { params });
    }

    createGrade(request: CreateGradeRequest): Observable<ApiResponse<GradeResponse>> {
        return this.http.post<ApiResponse<GradeResponse>>(`${this.API}/grades`, request);
    }

    toggleGradeActive(idGrade: number, isActive: boolean): Observable<ApiResponse<GradeResponse>> {
        const params = new HttpParams().set('isActive', isActive);
        return this.http.patch<ApiResponse<GradeResponse>>(`${this.API}/grades/${idGrade}/toggle-active`, null, { params });
    }

    // ── Sections ──────────────────────────────────────────────────────────────
    // GET /api/v1/academic/sections?idCompany=&idGrade=&idSchoolYear=

    getSections(idCompany: number, filter?: SectionFilter): Observable<ApiResponse<SectionResponse[]>> {
        let params = new HttpParams().set('idCompany', idCompany);
        if (filter?.idGrade) params = params.set('idGrade', filter.idGrade);
        if (filter?.idSchoolYear) params = params.set('idSchoolYear', filter.idSchoolYear);
        return this.http.get<ApiResponse<SectionResponse[]>>(`${this.API}/sections`, { params });
    }

    getSectionById(idSection: number): Observable<ApiResponse<SectionResponse>> {
        return this.http.get<ApiResponse<SectionResponse>>(`${this.API}/sections/${idSection}`);
    }

    createSection(request: CreateSectionRequest): Observable<ApiResponse<SectionResponse>> {
        return this.http.post<ApiResponse<SectionResponse>>(`${this.API}/sections`, request);
    }

    updateSection(idSection: number, request: CreateSectionRequest): Observable<ApiResponse<SectionResponse>> {
        return this.http.put<ApiResponse<SectionResponse>>(`${this.API}/sections/${idSection}`, request);
    }

    deleteSection(idSection: number): Observable<ApiResponse<void>> {
        return this.http.delete<ApiResponse<void>>(`${this.API}/sections/${idSection}`);
    }

    // ── Subjects ──────────────────────────────────────────────────────────────
    // GET /api/v1/academic/subjects?idCompany=

    getSubjects(idCompany: number): Observable<ApiResponse<SubjectResponse[]>> {
        const params = new HttpParams().set('idCompany', idCompany);
        return this.http.get<ApiResponse<SubjectResponse[]>>(`${this.API}/subjects`, { params });
    }

    createSubject(request: CreateSubjectRequest): Observable<ApiResponse<SubjectResponse>> {
        return this.http.post<ApiResponse<SubjectResponse>>(`${this.API}/subjects`, request);
    }

    toggleSubjectActive(idSubject: number, isActive: boolean): Observable<ApiResponse<SubjectResponse>> {
        const params = new HttpParams().set('isActive', isActive);
        return this.http.patch<ApiResponse<SubjectResponse>>(`${this.API}/subjects/${idSubject}/toggle-active`, null, { params });
    }

    // ── Class Schedules ───────────────────────────────────────────────────────
    // GET /api/v1/academic/schedules/by-section/{idSection}

    getSchedulesBySection(idSection: number): Observable<ApiResponse<ClassScheduleResponse[]>> {
        return this.http.get<ApiResponse<ClassScheduleResponse[]>>(`${this.API}/schedules/by-section/${idSection}`);
    }

    // GET /api/v1/academic/schedules/by-teacher/{idStaff}

    getSchedulesByTeacher(idStaff: number): Observable<ApiResponse<ClassScheduleResponse[]>> {
        return this.http.get<ApiResponse<ClassScheduleResponse[]>>(`${this.API}/schedules/by-teacher/${idStaff}`);
    }

    createSchedule(request: UpsertClassScheduleRequest): Observable<ApiResponse<ClassScheduleResponse>> {
        return this.http.post<ApiResponse<ClassScheduleResponse>>(`${this.API}/schedules`, request);
    }

    updateSchedule(idClassSchedule: number, request: UpsertClassScheduleRequest): Observable<ApiResponse<ClassScheduleResponse>> {
        return this.http.put<ApiResponse<ClassScheduleResponse>>(`${this.API}/schedules/${idClassSchedule}`, request);
    }

    deleteSchedule(idClassSchedule: number): Observable<ApiResponse<void>> {
        return this.http.delete<ApiResponse<void>>(`${this.API}/schedules/${idClassSchedule}`);
    }

    // ── Enrollments ───────────────────────────────────────────────────────────
    // POST /api/v1/academic/enrollments

    enrollStudent(request: EnrollStudentRequest): Observable<ApiResponse<void>> {
        return this.http.post<ApiResponse<void>>(`${this.API}/enrollments`, request);
    }

    // PATCH /api/v1/academic/enrollments/{id}/withdraw

    withdrawStudent(idStudentEnrollment: number): Observable<ApiResponse<void>> {
        return this.http.patch<ApiResponse<void>>(`${this.API}/enrollments/${idStudentEnrollment}/withdraw`, null);
    }

    // ── Students by section ───────────────────────────────────────────────────
    // GET /api/v1/students/by-section/{idSection}

    getStudentsBySection(idSection: number): Observable<ApiResponse<StudentResponse[]>> {
        return this.http.get<ApiResponse<StudentResponse[]>>(`${environment.apiUrl}students/by-section/${idSection}`);
    }

    // ── Grade Scores ──────────────────────────────────────────────────────────
    // GET /api/v1/academic/scores/by-enrollment/{idStudentEnrollment}

    getScoresByEnrollment(idStudentEnrollment: number): Observable<ApiResponse<GradeScoreResponse[]>> {
        return this.http.get<ApiResponse<GradeScoreResponse[]>>(`${this.API}/scores/by-enrollment/${idStudentEnrollment}`);
    }

    // GET /api/v1/academic/scores/by-section/{idSection}?idSchoolPeriod=

    getScoresBySection(idSection: number, idSchoolPeriod?: number): Observable<ApiResponse<GradeScoreResponse[]>> {
        let params = new HttpParams();
        if (idSchoolPeriod) params = params.set('idSchoolPeriod', idSchoolPeriod);
        return this.http.get<ApiResponse<GradeScoreResponse[]>>(`${this.API}/scores/by-section/${idSection}`, { params });
    }

    // POST /api/v1/academic/scores  (upsert por enrollment + materia + período)

    upsertScore(request: UpsertGradeScoreRequest): Observable<ApiResponse<GradeScoreResponse>> {
        return this.http.post<ApiResponse<GradeScoreResponse>>(`${this.API}/scores`, request);
    }

    // ── Stats ─────────────────────────────────────────────────────────────────
    // GET /api/v1/academic/stats?idCompany=

    getStats(idCompany: number): Observable<ApiResponse<AcademicStatsResponse>> {
        const params = new HttpParams().set('idCompany', idCompany);
        return this.http.get<ApiResponse<AcademicStatsResponse>>(`${this.API}/stats`, { params });
    }
}
