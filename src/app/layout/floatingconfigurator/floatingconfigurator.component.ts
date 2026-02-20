import { Component, computed, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { ConfiguratorComponent } from '../configurator/configurator.component';
import { StyleClassModule } from 'primeng/styleclass';
import { LayoutService } from '../../core/services/conf/layout.service';

@Component({
    selector: 'app-floatingconfigurator',
    imports: [ButtonModule, StyleClassModule, ConfiguratorComponent],
    templateUrl: './floatingconfigurator.component.html',
    styleUrl: './floatingconfigurator.component.scss'
})
export class FloatingconfiguratorComponent {
    LayoutService = inject(LayoutService);

    isDarkTheme = computed(() => this.LayoutService.layoutConfig().darkTheme);

    toggleDarkMode() {
        this.LayoutService.layoutConfig.update((state) => ({
            ...state,
            darkTheme: !state.darkTheme
        }));
    }
}
