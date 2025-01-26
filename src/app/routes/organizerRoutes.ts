import { AuthGuard } from '../services/auth/auth.guard';

export const organizerRoutes = [
  {
    path: 'od/my-events',
    loadComponent: () =>
      import(
        '../components/od/od-events-component/od-events-component.component'
      ).then((m) => m.OdEventsComponent),
    canMatch: [AuthGuard.canMatch],
    data: {
      roles: [
        'ROLE_OD',
        //admin for testing purposes!
        'ROLE_ADMIN',
      ],
    },
  },
  {
    path: 'od/create-event',
    loadComponent: () =>
      import(
        '../components/od/create-event-component/create-event-component.component'
      ).then((m) => m.CreateEventComponent),
    canMatch: [AuthGuard.canMatch],
    data: {
      roles: [
        'ROLE_OD',
        //admin for testing purposes!
        'ROLE_ADMIN',
      ],
    },
  },
];
