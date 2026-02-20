import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { StyleClassModule } from 'primeng/styleclass';
import { TooltipModule } from 'primeng/tooltip';
import { LayoutService } from '../../core/services/conf/layout.service';
import { ConfiguratorComponent } from '../configurator/configurator.component';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../../core/services/api/auth.service';

@Component({
    selector: 'app-topbar',
    imports: [RouterModule, CommonModule, StyleClassModule, ConfiguratorComponent, TooltipModule, DialogModule, ButtonModule],
    templateUrl: './topbar.component.html',
    styleUrl: './topbar.component.scss'
})
export class TopbarComponent {
    items!: MenuItem[];
    private authService = inject(AuthService);
    rolUser = this.authService.getUserRole();
    user: boolean = false;
    displayConfirmation: boolean = false;

    constructor(
        public layoutService: LayoutService,
        private router: Router
    ) {
        const roleUser = !this.authService.hasRole('CUSTOMER');

        console.log(this.rolUser);

        this.user = roleUser;
        if (!this.user) {
            this.layoutService.onMenuToggle();
        }
    }

    toggleDarkMode() {
        this.layoutService.layoutConfig.update((state) => ({
            ...state,
            darkTheme: !state.darkTheme
        }));
    }

    goto(ruta: string) {
        this.router.navigate([ruta]);
    }

    openConfirmation() {
        this.displayConfirmation = true;
    }

    closeConfirmation(confirmation: boolean) {
        if (confirmation) {
            this.authService.logout(); // 🔥 Esto limpia todo y redirige
        }
        this.displayConfirmation = false;
    }
}
