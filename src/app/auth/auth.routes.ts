import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { ForgotComponent } from './forgot/forgot.component';

export default [
    { path: '', component: LoginComponent },
    { path: 'login', component: LoginComponent },
    { path: 'forgot', component: ForgotComponent }
    // { path: 'login', component: Login },
] as Routes;
