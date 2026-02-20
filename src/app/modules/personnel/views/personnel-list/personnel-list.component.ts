import { CommonModule } from '@angular/common';
import { Component, computed, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// PrimeNG
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';

// Services & Models
import { StaffDTO } from '../../../../core/models/dto/staff.dto';
import { STAFF_TYPE_OPTIONS } from '../../../../core/models/enums/staff.enum';
import { StaffApiService } from '../../../../core/services/api/staff-api.service';
import { NotificationService } from '../../../../shared/components/notification-modal/notification.service';

@Component({
    selector: 'app-personnel-list',
    standalone: true,
    imports: [CommonModule, FormsModule, TableModule, ButtonModule, InputTextModule, TagModule, TooltipModule, ConfirmDialogModule, SelectModule, IconFieldModule, InputIconModule, SkeletonModule],
    providers: [ConfirmationService],
    templateUrl: './personnel-list.component.html',
    styleUrl: './personnel-list.component.scss'
})
export class PersonnelListComponent implements OnInit {
    staff = signal<StaffDTO[]>([]);
    loading = signal(true);
    searchQuery = signal('');
    filterType = signal<string | null>(null);

    staffTypeOptions = [{ label: 'Todos los tipos', value: null }, ...STAFF_TYPE_OPTIONS];

    filteredStaff = computed(() => {
        let list = this.staff();
        const query = this.searchQuery().toLowerCase().trim();
        const type = this.filterType();

        if (query) {
            list = list.filter(
                (s) =>
                    s.person?.firstName?.toLowerCase().includes(query) ||
                    s.person?.lastName?.toLowerCase().includes(query) ||
                    s.employeeNumber?.toLowerCase().includes(query) ||
                    s.person?.documentNumber?.toLowerCase().includes(query) ||
                    s.position?.toLowerCase().includes(query) ||
                    s.department?.toLowerCase().includes(query)
            );
        }

        if (type) {
            list = list.filter((s) => s.staffType === type);
        }

        return list;
    });

    constructor(
        private staffApi: StaffApiService,
        private router: Router,
        private confirmationService: ConfirmationService,
        private notifier: NotificationService
    ) {}

    ngOnInit(): void {
        this.loadStaff();
    }

    loadStaff(): void {
        this.loading.set(true);
        this.staffApi.getAll().subscribe({
            next: (res) => {
                if (res.success) this.staff.set(res.data);
                this.loading.set(false);
            },
            error: () => {
                this.notifier.error('Error al cargar el personal');
                this.loading.set(false);
            }
        });
    }

    goToNew(): void {
        this.router.navigate(['/sys/personal/nuevo']);
    }

    goToEdit(id: number): void {
        this.router.navigate(['/sys/personal/editar', id]);
    }

    goToDetail(id: number): void {
        this.router.navigate(['/sys/personal/detalle', id]);
    }

    confirmToggle(staff: StaffDTO): void {
        const action = staff.isActive ? 'desactivar' : 'activar';
        this.confirmationService.confirm({
            message: `¿Está seguro de que desea ${action} a <strong>${this.getFullName(staff)}</strong>?`,
            header: 'Confirmar acción',
            icon: staff.isActive ? 'pi pi-ban' : 'pi pi-check-circle',
            acceptLabel: 'Sí, confirmar',
            rejectLabel: 'Cancelar',
            acceptButtonStyleClass: staff.isActive ? 'p-button-danger' : 'p-button-success',
            accept: () => this.toggleActive(staff)
        });
    }

    private toggleActive(staff: StaffDTO): void {
        this.staffApi.toggleActive(staff.idStaff!).subscribe({
            next: (res) => {
                if (res.success) {
                    this.notifier.success(res.message || 'Estado actualizado');
                    this.loadStaff();
                }
            },
            error: () => this.notifier.error('Error al actualizar el estado')
        });
    }

    getFullName(staff: StaffDTO): string {
        if (!staff.person) return staff.fullName ?? '—';
        return `${staff.person.firstName} ${staff.person.lastName}`;
    }

    getTypeSeverity(type: string): 'success' | 'info' | 'warn' | 'secondary' | 'danger' | 'contrast' {
        const map: Record<string, 'success' | 'info' | 'warn' | 'secondary' | 'danger' | 'contrast'> = {
            TEACHER: 'info',
            ADMINISTRATIVE: 'success',
            SUPPORT: 'warn',
            DIRECTOR: 'contrast'
        };
        return map[type] ?? 'secondary';
    }

    getTypeLabel(type: string): string {
        const map: Record<string, string> = {
            TEACHER: 'Docente',
            ADMINISTRATIVE: 'Administrativo',
            SUPPORT: 'Apoyo',
            DIRECTOR: 'Director'
        };
        return map[type] ?? type;
    }

    getStatusSeverity(status: string): 'success' | 'danger' | 'warn' | 'secondary' | 'info' | 'contrast' {
        const map: Record<string, 'success' | 'danger' | 'warn' | 'secondary' | 'info' | 'contrast'> = {
            ACTIVE: 'success',
            INACTIVE: 'danger',
            ON_LEAVE: 'warn',
            TERMINATED: 'secondary'
        };
        return map[status] ?? 'secondary';
    }

    getStatusLabel(status: string): string {
        const map: Record<string, string> = {
            ACTIVE: 'Activo',
            INACTIVE: 'Inactivo',
            ON_LEAVE: 'De licencia',
            TERMINATED: 'Desvinculado'
        };
        return map[status] ?? status;
    }
}
