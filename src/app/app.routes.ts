import { Routes } from '@angular/router';
import { adminRoutes } from './routes/adminRoutes';
import { generalRoutes } from './routes/generalRoutes';
import { organizerRoutes } from './routes/organizerRoutes';
import { providerRoutes } from './routes/providerRoutes';
import { userRoutes } from './routes/userRoutes';

export const routes: Routes = [
  ...generalRoutes,
  ...providerRoutes,
  ...userRoutes,
  ...adminRoutes,
  ...organizerRoutes,
];
