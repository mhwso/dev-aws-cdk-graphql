import { Routes } from '@angular/router'
import { Pages } from './enums/Pages'
import { AuthGuard } from './guards/auth.guard'

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: Pages.LOGIN,
    loadComponent: () => import('./pages/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: Pages.REGISTER,
    loadComponent: () => import('./pages/register/register.page').then((m) => m.RegisterPage),
  },
  {
    path: Pages.DASHBOARD,
    canActivate: [AuthGuard],
    loadComponent: () => import('./pages/dashboard/dashboard.page').then((m) => m.DashboardPage),
  },
]
