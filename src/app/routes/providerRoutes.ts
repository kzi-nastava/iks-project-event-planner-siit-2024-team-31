import { AuthGuard } from '../services/auth/auth.guard';

export const providerRoutes = [
  {
    path: 'pup/create-service',
    loadComponent: () =>
      import(
        '../components/pup/create-service-component/create-service-component.component'
      ).then((m) => m.CreateServiceComponent),
    canMatch: [AuthGuard.canMatch],
    data: {
      roles: [
        'ROLE_PUP',
        //admin for testing purposes!
        'ROLE_ADMIN',
      ],
    },
  },
  {
    path: 'pup/my-products-services',
    loadComponent: () =>
      import(
        '../components/pup/pup-products-services-component/pup-products-services-component.component'
      ).then((m) => m.PupProductsServicesComponent),
    canMatch: [AuthGuard.canMatch],
    data: {
      roles: [
        'ROLE_PUP',
        //admin for testing purposes!
        'ROLE_ADMIN',
      ],
    },
  },
];
