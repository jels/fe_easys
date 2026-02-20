import { Component, EventEmitter, Output } from '@angular/core';
// import { RecaptchaModule } from 'ng-recaptcha-2';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-recaptcha',
  imports: [
    // RecaptchaModule
  ],
  standalone: true,
  templateUrl: './recaptcha.component.html',
  styleUrl: './recaptcha.component.scss',
})
export class RecaptchaComponent {
  @Output() captcha = new EventEmitter<any>();

  // YOUR_SITE_KEY = environment.YOUR_SITE_KEY;

  resolved(captchaResponse: string | null) {
    this.captcha.emit(captchaResponse);
    console.log(`Resolved captcha with response: ${captchaResponse}`);
  }
}
