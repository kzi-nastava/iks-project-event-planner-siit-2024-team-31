import { AuthGuard } from '../services/auth/auth.guard';
import { Role } from '../types/roles';

export const generalRoutes = [
  {
    path: 'my-profile',
    loadComponent: () =>
      import(
        '../components/all-users-components/my-profile-component/my-profile-component.component'
      ).then((m) => m.MyProfileComponent),
    canMatch: [AuthGuard.canMatch],
    data: {
      roles: [Role.ROLE_ADMIN, Role.ROLE_USER, Role.ROLE_PUP, Role.ROLE_OD],
    },
  },
  {
    path: 'services',
    loadComponent: () =>
      import(
        '../components/service-list/service-list-filtered/service-list-filtered.component'
      ).then((m) => m.ServiceListFilteredComponent),
  },
  {
    path: 'events',
    loadComponent: () =>
      import(
        '../components/event-list/event-list-filtered/event-list-filtered.component'
      ).then((m) => m.EventListFilteredComponent),
  },
  {
    path: 'services/:id',
    loadComponent: () =>
      import('../components/service-detail/service-detail.component').then(
        (m) => m.ServiceDetailComponent
      ),
  },
  {
    path: 'events/:id',
    loadComponent: () =>
      import('../components/event-detail/event-detail.component').then(
        (m) => m.EventDetailComponent
      ),
  },
  {
    path: '',
    loadComponent: () =>
      import('../components/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('../components/auth/register/register.component').then(
        (m) => m.RegisterComponent
      ),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('../components/auth/login/login.component').then(
        (m) => m.LoginComponent
      ),
  },
  {
    path: 'access-denied',
    loadComponent: () =>
      import('../components/utils/access-denied/access-denied.component').then(
        (m) => m.AccessDeniedComponent
      ),
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import(
        '../components/auth/forgot-password/forgot-password.component'
      ).then((m) => m.ForgotPasswordComponent),
  },
];
