import { Routes } from '@angular/router';
import { AuthGuard } from './services/auth/auth.guard';

export const routes: Routes = [
  {
    path: 'pup/create-service',
    loadComponent: () =>
      import(
        './components/pup/create-service-component/create-service-component.component'
      ).then((m) => m.CreateServiceComponent),
    canMatch: [AuthGuard.canMatch],
    data: { roles: ['ROLE_PUP'] },
  },
  {
    path: 'pup/my-products-services',
    loadComponent: () =>
      import(
        './components/pup/pup-products-services-component/pup-products-services-component.component'
      ).then((m) => m.PupProductsServicesComponent),
    canMatch: [AuthGuard.canMatch],
    data: { roles: ['ROLE_PUP'] },
  },
  {
    path: 'od/my-events',
    loadComponent: () =>
      import(
        './components/od/od-events-component/od-events-component.component'
      ).then((m) => m.OdEventsComponent),
    canMatch: [AuthGuard.canMatch],
    data: { roles: ['ROLE_OD'] },
  },
  {
    path: 'od/create-event',
    loadComponent: () =>
      import(
        './components/od/create-event-component/create-event-component.component'
      ).then((m) => m.CreateEventComponent),
    canMatch: [AuthGuard.canMatch],
    data: { roles: ['ROLE_OD'] },
  },
  {
    path: 'my-profile',
    loadComponent: () =>
      import(
        './components/all-users-components/my-profile-component/my-profile-component.component'
      ).then((m) => m.MyProfileComponent),
    canMatch: [AuthGuard.canMatch],
    data: { roles: ['ROLE_USER', 'ROLE_PUP', 'ROLE_ADMIN', 'ROLE_OD'] },
  },
  {
    path: 'services',
    loadComponent: () =>
      import(
        './components/service-list/service-list-filtered/service-list-filtered.component'
      ).then((m) => m.ServiceListFilteredComponent),
  },
  {
    path: 'events',
    loadComponent: () =>
      import(
        './components/event-list/event-list-filtered/event-list-filtered.component'
      ).then((m) => m.EventListFilteredComponent),
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
  {
    path: 'access-denied',
    loadComponent: () =>
      import('./components/utils/access-denied/access-denied.component').then(
        (m) => m.AccessDeniedComponent
      ),
  },
];
