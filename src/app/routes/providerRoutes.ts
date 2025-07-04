import { AuthGuard } from '../services/auth/auth.guard';
import { Role } from '../types/roles';

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
        Role.ROLE_PUP,
        //admin for testing purposes!
        Role.ROLE_ADMIN,
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
        Role.ROLE_PUP,
        //admin for testing purposes!
        Role.ROLE_ADMIN,
      ],
    },
  },
  {
    path: 'pup/edit-product/:id',
    loadComponent: () =>
      import(
        '../components/pup/edit-product-component/edit-product-component.component'
      ).then((m) => m.EditProductComponent),
    canMatch: [AuthGuard.canMatch],
    data: {
      roles: [
        Role.ROLE_PUP,
        //admin for testing purposes!
        Role.ROLE_ADMIN,
      ],
    },
  },
  {
    path: 'pup/edit-service/:id',
    loadComponent: () =>
      import(
        '../components/pup/edit-service-component/edit-service-component.component'
      ).then((m) => m.EditServiceComponent),
    canMatch: [AuthGuard.canMatch],
    data: {
      roles: [
        Role.ROLE_PUP,
        //admin for testing purposes!
        Role.ROLE_ADMIN,
      ],
    },
  },
];
