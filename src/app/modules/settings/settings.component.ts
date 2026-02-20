// src/app/modules/settings/settings.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TabsModule } from 'primeng/tabs';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { TextareaModule } from 'primeng/textarea';
import { DatePickerModule } from 'primeng/datepicker';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { DividerModule } from 'primeng/divider';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { CompanyMock, BranchMock, SystemParamMock } from '../../shared/data/company.mock';
import { SchoolYearMock, SchoolPeriodMock } from '../../shared/data/academic.mock';
import { CreatePeriodRequest, CreateSchoolYearRequest, SettingsService, UpdateCompanyRequest, UpsertBranchRequest } from '../../core/services/conf/settings.service';

@Component({
    selector: 'app-settings',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        TabsModule,
        TableModule,
        TagModule,
        ButtonModule,
        InputTextModule,
        SelectModule,
        DatePickerModule,
        TextareaModule,
        ToggleSwitchModule,
        DialogModule,
        SkeletonModule,
        InputNumberModule,
        TooltipModule,
        ToastModule,
        ConfirmDialogModule,
        DividerModule
    ],
    templateUrl: './settings.component.html',
    styleUrl: './settings.component.scss',
    providers: [MessageService, ConfirmationService]
})
export class SettingsComponent implements OnInit, OnDestroy {
    activeTab = signal('0');

    // ── Stats ─────────────────────────────────────────────────────────────────
    stats = signal<any>(null);

    // ── Tab 0: Empresa ────────────────────────────────────────────────────────
    company = signal<CompanyMock | null>(null);
    loadingCompany = signal(false);
    savingCompany = signal(false);
    editingCompany = signal(false);
    companyForm!: FormGroup;

    // ── Tab 1: Sucursales ─────────────────────────────────────────────────────
    branches = signal<BranchMock[]>([]);
    loadingBranches = signal(false);
    showBranchForm = signal(false);
    savingBranch = signal(false);
    editingBranch = signal<BranchMock | null>(null);
    branchForm!: FormGroup;

    // ── Tab 2: Año lectivo ────────────────────────────────────────────────────
    schoolYears = signal<SchoolYearMock[]>([]);
    periods = signal<SchoolPeriodMock[]>([]);
    selectedYear = signal<SchoolYearMock | null>(null);
    loadingYears = signal(false);
    loadingPeriods = signal(false);
    showYearForm = signal(false);
    showPeriodForm = signal(false);
    savingYear = signal(false);
    savingPeriod = signal(false);
    yearForm!: FormGroup;
    periodForm!: FormGroup;

    // ── Tab 3: Parámetros ─────────────────────────────────────────────────────
    params = signal<SystemParamMock[]>([]);
    loadingParams = signal(false);
    activeParamCategory = signal('GENERAL');
    editingParamId = signal<number | null>(null);
    paramTempValues = new Map<number, string>();

    readonly paramCategories = [
        { key: 'GENERAL', label: 'General', icon: 'pi-cog' },
        { key: 'ACADEMIC', label: 'Académico', icon: 'pi-book' },
        { key: 'FINANCIAL', label: 'Financiero', icon: 'pi-dollar' },
        { key: 'ACCESS', label: 'Control Acceso', icon: 'pi-shield' },
        { key: 'NOTIFICATIONS', label: 'Notificaciones', icon: 'pi-bell' }
    ];

    private destroy$ = new Subject<void>();

    constructor(
        private settingsService: SettingsService,
        private fb: FormBuilder,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {
        this.buildForms();
    }

    ngOnInit(): void {
        this.loadAll();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    // ── Carga inicial ─────────────────────────────────────────────────────────

    loadAll(): void {
        this.loadCompany();
        this.loadBranches();
        this.loadYears();
        this.loadParams();
        this.settingsService
            .getSettingsStats()
            .pipe(takeUntil(this.destroy$))
            .subscribe((s) => this.stats.set(s));
    }

    // ── Tab 0: Empresa ────────────────────────────────────────────────────────

    loadCompany(): void {
        this.loadingCompany.set(true);
        this.settingsService
            .getCompany()
            .pipe(takeUntil(this.destroy$))
            .subscribe((c) => {
                this.company.set(c);
                this.loadingCompany.set(false);
            });
    }

    startEditCompany(): void {
        const c = this.company();
        if (!c) return;
        this.companyForm.patchValue({
            name: c.name,
            tradeName: c.tradeName,
            ruc: c.ruc,
            address: c.address,
            phone: c.phone,
            email: c.email
        });
        this.editingCompany.set(true);
    }

    cancelEditCompany(): void {
        this.editingCompany.set(false);
    }

    saveCompany(): void {
        if (this.companyForm.invalid) {
            this.companyForm.markAllAsTouched();
            return;
        }
        this.savingCompany.set(true);
        const req: UpdateCompanyRequest = this.companyForm.value;
        this.settingsService
            .updateCompany(req)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (c) => {
                    this.company.set(c);
                    this.editingCompany.set(false);
                    this.savingCompany.set(false);
                    this.loadAll();
                    this.messageService.add({ severity: 'success', summary: 'Datos actualizados', detail: c.name });
                },
                error: () => this.savingCompany.set(false)
            });
    }

    // ── Tab 1: Sucursales ─────────────────────────────────────────────────────

    loadBranches(): void {
        this.loadingBranches.set(true);
        this.settingsService
            .getBranches()
            .pipe(takeUntil(this.destroy$))
            .subscribe((b) => {
                this.branches.set(b);
                this.loadingBranches.set(false);
            });
    }

    openNewBranch(): void {
        this.editingBranch.set(null);
        this.branchForm.reset({ isMain: false });
        this.showBranchForm.set(true);
    }

    openEditBranch(branch: BranchMock): void {
        this.editingBranch.set(branch);
        this.branchForm.patchValue({
            name: branch.name,
            code: branch.code,
            address: branch.address,
            phone: branch.phone,
            isMain: branch.isMain
        });
        this.showBranchForm.set(true);
    }

    saveBranch(): void {
        if (this.branchForm.invalid) {
            this.branchForm.markAllAsTouched();
            return;
        }
        this.savingBranch.set(true);
        const req: UpsertBranchRequest = {
            ...this.branchForm.value,
            idBranch: this.editingBranch()?.idBranch
        };
        this.settingsService
            .saveBranch(req)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.savingBranch.set(false);
                    this.showBranchForm.set(false);
                    this.loadBranches();
                    this.loadAll();
                    this.messageService.add({
                        severity: 'success',
                        summary: this.editingBranch() ? 'Sucursal actualizada' : 'Sucursal creada'
                    });
                },
                error: () => this.savingBranch.set(false)
            });
    }

    confirmDeleteBranch(branch: BranchMock): void {
        if (branch.isMain) {
            this.messageService.add({ severity: 'warn', summary: 'No permitido', detail: 'No se puede eliminar la sede principal' });
            return;
        }
        this.confirmationService.confirm({
            message: `¿Eliminar la sucursal "${branch.name}"?`,
            header: 'Confirmar eliminación',
            icon: 'pi pi-trash',
            accept: () => {
                this.settingsService
                    .deleteBranch(branch.idBranch)
                    .pipe(takeUntil(this.destroy$))
                    .subscribe(() => {
                        this.loadBranches();
                        this.loadAll();
                        this.messageService.add({ severity: 'success', summary: 'Sucursal eliminada' });
                    });
            }
        });
    }

    // ── Tab 2: Año lectivo ────────────────────────────────────────────────────

    loadYears(): void {
        this.loadingYears.set(true);
        this.settingsService
            .getSchoolYears()
            .pipe(takeUntil(this.destroy$))
            .subscribe((y) => {
                this.schoolYears.set(y);
                this.loadingYears.set(false);
            });
    }

    selectYear(year: SchoolYearMock): void {
        this.selectedYear.set(year);
        this.loadPeriods(year.idSchoolYear);
    }

    loadPeriods(idSchoolYear: number): void {
        this.loadingPeriods.set(true);
        this.settingsService
            .getPeriodsByYear(idSchoolYear)
            .pipe(takeUntil(this.destroy$))
            .subscribe((p) => {
                this.periods.set(p);
                this.loadingPeriods.set(false);
            });
    }

    toggleYear(year: SchoolYearMock): void {
        const newState = !year.isActive;
        const label = newState ? 'activar' : 'cerrar';
        this.confirmationService.confirm({
            message: `¿Confirma ${label} el año lectivo "${year.name}"?`,
            header: 'Cambiar estado',
            icon: 'pi pi-question-circle',
            accept: () => {
                this.settingsService
                    .toggleYearActive(year.idSchoolYear, newState)
                    .pipe(takeUntil(this.destroy$))
                    .subscribe(() => {
                        this.loadYears();
                        this.loadAll();
                        this.messageService.add({ severity: 'success', summary: `Año lectivo ${newState ? 'activado' : 'cerrado'}` });
                    });
            }
        });
    }

    openNewYear(): void {
        this.yearForm.reset();
        this.showYearForm.set(true);
    }

    saveYear(): void {
        if (this.yearForm.invalid) {
            this.yearForm.markAllAsTouched();
            return;
        }
        this.savingYear.set(true);
        const v = this.yearForm.value;
        const req: CreateSchoolYearRequest = {
            name: v.name,
            startDate: this.dateToStr(v.startDate),
            endDate: this.dateToStr(v.endDate)
        };
        this.settingsService
            .createSchoolYear(req)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.savingYear.set(false);
                    this.showYearForm.set(false);
                    this.loadYears();
                    this.messageService.add({ severity: 'success', summary: 'Año lectivo creado' });
                },
                error: () => this.savingYear.set(false)
            });
    }

    openNewPeriod(): void {
        if (!this.selectedYear()) return;
        const nextNum = this.periods().length + 1;
        this.periodForm.reset({ periodNumber: nextNum, idSchoolYear: this.selectedYear()!.idSchoolYear });
        this.showPeriodForm.set(true);
    }

    savePeriod(): void {
        if (this.periodForm.invalid) {
            this.periodForm.markAllAsTouched();
            return;
        }
        this.savingPeriod.set(true);
        const v = this.periodForm.value;
        const req: CreatePeriodRequest = {
            idSchoolYear: v.idSchoolYear,
            name: v.name,
            periodNumber: v.periodNumber,
            startDate: this.dateToStr(v.startDate),
            endDate: this.dateToStr(v.endDate)
        };
        this.settingsService
            .createPeriod(req)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.savingPeriod.set(false);
                    this.showPeriodForm.set(false);
                    this.loadPeriods(this.selectedYear()!.idSchoolYear);
                    this.messageService.add({ severity: 'success', summary: 'Período creado' });
                },
                error: () => this.savingPeriod.set(false)
            });
    }

    togglePeriod(period: SchoolPeriodMock): void {
        this.settingsService
            .togglePeriodActive(period.idSchoolPeriod, !period.isActive)
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => {
                this.loadPeriods(this.selectedYear()!.idSchoolYear);
                this.loadAll();
                this.messageService.add({ severity: 'success', summary: `Período ${!period.isActive ? 'activado' : 'cerrado'}` });
            });
    }

    // ── Tab 3: Parámetros ─────────────────────────────────────────────────────

    loadParams(): void {
        this.loadingParams.set(true);
        this.settingsService
            .getParams()
            .pipe(takeUntil(this.destroy$))
            .subscribe((p) => {
                this.params.set(p);
                this.loadingParams.set(false);
            });
    }

    get filteredParams(): SystemParamMock[] {
        return this.params().filter((p) => p.category === this.activeParamCategory());
    }

    startEditParam(param: SystemParamMock): void {
        this.paramTempValues.set(param.idParam, param.paramValue);
        this.editingParamId.set(param.idParam);
    }

    cancelEditParam(): void {
        this.editingParamId.set(null);
    }

    saveParam(param: SystemParamMock): void {
        const newValue = this.paramTempValues.get(param.idParam);
        if (newValue === undefined || newValue === param.paramValue) {
            this.editingParamId.set(null);
            return;
        }
        this.settingsService
            .updateParam(param.idParam, String(newValue))
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (updated) => {
                    this.editingParamId.set(null);
                    this.params.update((list) => list.map((p) => (p.idParam === updated.idParam ? updated : p)));
                    this.loadAll();
                    this.messageService.add({ severity: 'success', summary: 'Parámetro actualizado', detail: param.label, life: 2000 });
                }
            });
    }

    getParamTempValue(idParam: number): string {
        return this.paramTempValues.get(idParam) ?? '';
    }

    setParamTempValue(idParam: number, value: string): void {
        this.paramTempValues.set(idParam, value);
    }

    getParamOptions(param: SystemParamMock): { label: string; value: string }[] {
        if (!param.options) return [];
        try {
            return (JSON.parse(param.options) as string[]).map((o) => ({ label: o, value: o }));
        } catch {
            return [];
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    isFieldInvalid(form: FormGroup, field: string): boolean {
        const c = form.get(field);
        return !!(c?.invalid && c.touched);
    }

    private dateToStr(d: Date | string | null): string {
        if (!d) return '';
        if (typeof d === 'string') return d;
        return d.toISOString().split('T')[0];
    }

    private buildForms(): void {
        this.companyForm = this.fb.group({
            name: ['', Validators.required],
            tradeName: ['', Validators.required],
            ruc: ['', Validators.required],
            address: ['', Validators.required],
            phone: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]]
        });

        this.branchForm = this.fb.group({
            name: ['', Validators.required],
            code: ['', Validators.required],
            address: ['', Validators.required],
            phone: [''],
            isMain: [false]
        });

        this.yearForm = this.fb.group({
            name: ['', Validators.required],
            startDate: [null, Validators.required],
            endDate: [null, Validators.required]
        });

        this.periodForm = this.fb.group({
            idSchoolYear: [null],
            name: ['', Validators.required],
            periodNumber: [1, Validators.required],
            startDate: [null, Validators.required],
            endDate: [null, Validators.required]
        });
    }
}
