import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading-web',
  imports: [],
  templateUrl: './loading-web.component.html',
  styleUrl: './loading-web.component.scss',
})
export class LoadingWebComponent {
  @Input() status: Boolean = false;
  @Input() mensaje: string | null = null;
}
