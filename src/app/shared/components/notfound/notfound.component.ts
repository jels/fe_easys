import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { FloatingconfiguratorComponent } from '../../../layout/floatingconfigurator/floatingconfigurator.component';

@Component({
    selector: 'app-notfound',
    standalone: true,
    imports: [RouterModule, FloatingconfiguratorComponent, ButtonModule],
    templateUrl: './notfound.component.html',
    styleUrl: './notfound.component.scss'
})
export class NotfoundComponent {
    constructor(private router: Router) {}
    goto(ruta: string) {
        this.router.navigate([ruta]);
    }
}
