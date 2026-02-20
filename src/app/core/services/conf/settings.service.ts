// src/app/core/services/conf/settings.service.ts
import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

import { MOCK_COMPANY, MOCK_BRANCHES, CompanyMock, BranchMock, MOCK_SYSTEM_PARAMS, SystemParamMock } from '../../../shared/data/company.mock';
import { MOCK_SCHOOL_YEARS, MOCK_SCHOOL_PERIODS, SchoolYearMock, SchoolPeriodMock } from '../../../shared/data/academic.mock';

export interface UpdateCompanyRequest {
    name: string;
    tradeName: string;
    ruc: string;
    address: string;
    phone: string;
    email: string;
}

export interface UpsertBranchRequest {
    idBranch?: number;
    name: string;
    code: string;
    address: string;
    phone: string;
    isMain: boolean;
}

export interface CreateSchoolYearRequest {
    name: string;
    startDate: string;
    endDate: string;
}

export interface CreatePeriodRequest {
    idSchoolYear: number;
    name: string;
    periodNumber: number;
    startDate: string;
    endDate: string;
}

@Injectable({ providedIn: 'root' })
export class SettingsService {
    readonly DEMO_MODE = true;
    private readonly DELAY_MS = 350;

    private _company = signal<CompanyMock>({ ...MOCK_COMPANY });
    private _branches = signal<BranchMock[]>([...MOCK_BRANCHES]);
    private _params = signal<SystemParamMock[]>([...MOCK_SYSTEM_PARAMS]);
    private _years = signal<SchoolYearMock[]>([...MOCK_SCHOOL_YEARS]);
    private _periods = signal<SchoolPeriodMock[]>([...MOCK_SCHOOL_PERIODS]);
    private nextBranchId = 10;
    private nextYearId = 10;
    private nextPeriodId = 10;

    // ── Empresa ───────────────────────────────────────────────────────────────

    getCompany(): Observable<CompanyMock> {
        return of({ ...this._company() }).pipe(delay(this.DELAY_MS));
    }

    updateCompany(req: UpdateCompanyRequest): Observable<CompanyMock> {
        const updated = { ...this._company(), ...req };
        this._company.set(updated);
        return of(updated).pipe(delay(600));
    }

    // ── Sucursales ────────────────────────────────────────────────────────────

    getBranches(): Observable<BranchMock[]> {
        return of(this._branches().filter((b) => b.isActive)).pipe(delay(this.DELAY_MS));
    }

    saveBranch(req: UpsertBranchRequest): Observable<BranchMock> {
        if (req.idBranch) {
            // Update
            this._branches.update((list) => list.map((b) => (b.idBranch === req.idBranch ? { ...b, ...req } : b)));
            const updated = this._branches().find((b) => b.idBranch === req.idBranch)!;
            return of(updated).pipe(delay(600));
        } else {
            // Create
            const newBranch: BranchMock = {
                idBranch: this.nextBranchId++,
                idCompany: 1,
                name: req.name,
                code: req.code,
                address: req.address,
                phone: req.phone,
                isMain: req.isMain,
                isActive: true
            };
            // Si se marca como principal, desmarcar las demás
            if (req.isMain) {
                this._branches.update((list) => list.map((b) => ({ ...b, isMain: false })));
            }
            this._branches.update((list) => [...list, newBranch]);
            return of(newBranch).pipe(delay(600));
        }
    }

    deleteBranch(idBranch: number): Observable<void> {
        this._branches.update((list) => list.map((b) => (b.idBranch === idBranch ? { ...b, isActive: false } : b)));
        return of(void 0).pipe(delay(400));
    }

    // ── Año lectivo ───────────────────────────────────────────────────────────

    getSchoolYears(): Observable<SchoolYearMock[]> {
        return of([...this._years()].sort((a, b) => b.idSchoolYear - a.idSchoolYear)).pipe(delay(this.DELAY_MS));
    }

    getPeriodsByYear(idSchoolYear: number): Observable<SchoolPeriodMock[]> {
        return of(
            this._periods()
                .filter((p) => p.idSchoolYear === idSchoolYear)
                .sort((a, b) => a.periodNumber - b.periodNumber)
        ).pipe(delay(this.DELAY_MS));
    }

    createSchoolYear(req: CreateSchoolYearRequest): Observable<SchoolYearMock> {
        const newYear: SchoolYearMock = {
            idSchoolYear: this.nextYearId++,
            idCompany: 1,
            name: req.name,
            startDate: req.startDate,
            endDate: req.endDate,
            isActive: false
        };
        this._years.update((list) => [...list, newYear]);
        return of(newYear).pipe(delay(600));
    }

    toggleYearActive(idSchoolYear: number, isActive: boolean): Observable<SchoolYearMock> {
        // Solo uno puede estar activo a la vez
        if (isActive) {
            this._years.update((list) => list.map((y) => ({ ...y, isActive: false })));
        }
        this._years.update((list) => list.map((y) => (y.idSchoolYear === idSchoolYear ? { ...y, isActive } : y)));
        const updated = this._years().find((y) => y.idSchoolYear === idSchoolYear)!;
        return of(updated).pipe(delay(400));
    }

    createPeriod(req: CreatePeriodRequest): Observable<SchoolPeriodMock> {
        const year = this._years().find((y) => y.idSchoolYear === req.idSchoolYear);
        const newPeriod: SchoolPeriodMock = {
            idSchoolPeriod: this.nextPeriodId++,
            idSchoolYear: req.idSchoolYear,
            schoolYearName: year?.name,
            name: req.name,
            periodNumber: req.periodNumber,
            startDate: req.startDate,
            endDate: req.endDate,
            isActive: false
        };
        this._periods.update((list) => [...list, newPeriod]);
        return of(newPeriod).pipe(delay(600));
    }

    togglePeriodActive(idSchoolPeriod: number, isActive: boolean): Observable<SchoolPeriodMock> {
        this._periods.update((list) => list.map((p) => (p.idSchoolPeriod === idSchoolPeriod ? { ...p, isActive } : p)));
        const updated = this._periods().find((p) => p.idSchoolPeriod === idSchoolPeriod)!;
        return of(updated).pipe(delay(400));
    }

    // ── Parámetros del sistema ────────────────────────────────────────────────

    getParams(category?: string): Observable<SystemParamMock[]> {
        let result = this._params().filter((p) => p.isActive);
        if (category) result = result.filter((p) => p.category === category);
        return of(result).pipe(delay(this.DELAY_MS));
    }

    updateParam(idParam: number, newValue: string): Observable<SystemParamMock> {
        this._params.update((list) => list.map((p) => (p.idParam === idParam ? { ...p, paramValue: newValue } : p)));
        const updated = this._params().find((p) => p.idParam === idParam)!;
        return of(updated).pipe(delay(400));
    }

    // ── Stats para la pantalla ────────────────────────────────────────────────

    getSettingsStats(): Observable<{
        totalBranches: number;
        activeYear: string;
        activePeriod: string;
        totalParams: number;
        demoMode: boolean;
    }> {
        const activeYear = this._years().find((y) => y.isActive);
        const activePeriod = this._periods().find((p) => p.isActive);
        const demoParam = this._params().find((p) => p.paramKey === 'DEMO_MODE');

        return of({
            totalBranches: this._branches().filter((b) => b.isActive).length,
            activeYear: activeYear?.name ?? 'Sin año activo',
            activePeriod: activePeriod?.name ?? 'Sin período activo',
            totalParams: this._params().filter((p) => p.isActive && p.isEditable).length,
            demoMode: demoParam?.paramValue === 'true'
        }).pipe(delay(this.DELAY_MS));
    }
}
