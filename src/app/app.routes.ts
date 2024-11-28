import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'services',
    loadComponent: () =>
      import('./components/service-list/service-list.component').then(
        (m) => m.ServiceListComponent
      ),
  },
  {
    path: 'events',
    loadComponent: () =>
      import('./components/event-list/event-list.component').then(
        (m) => m.EventListComponent
      ),
  },
  {
    path: 'services/:id',
    loadComponent: () =>
      import('./components/service-detail/service-detail.component').then(
        (m) => m.ServiceDetailComponent
      ),
  },
  {
    path: 'events/:id',
    loadComponent: () =>
      import('./components/event-detail/event-detail.component').then(
        (m) => m.EventDetailComponent
      ),
  },
  {
    path: '',
    loadComponent: () =>
      import('./components/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./components/auth/register/register.component').then(
        (m) => m.RegisterComponent
      ),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./components/auth/login/login.component').then(
        (m) => m.LoginComponent
      ),
  },
];
