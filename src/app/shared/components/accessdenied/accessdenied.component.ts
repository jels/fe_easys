import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FloatingconfiguratorComponent } from '../../../layout/floatingconfigurator/floatingconfigurator.component';
import { ButtonModule } from 'primeng/button';

@Component({
    selector: 'app-accessdenied',
    standalone: true,
    imports: [RouterModule, FloatingconfiguratorComponent, ButtonModule],
    templateUrl: './accessdenied.component.html',
    styleUrl: './accessdenied.component.scss'
})
export class AccessdeniedComponent {
    constructor(private router: Router) {}
    goto(ruta: string) {
        this.router.navigate([ruta]);
    }
}
