import {AuthGuard} from '../services/auth/auth.guard';
import {Role} from "../types/roles";

export const adminRoutes = [
	{
		path: 'admin/event-types',
		loadComponent: () =>
			import(
				'../components/admin/event-types-management/event-types-management.component'
				).then((m) => m.EventTypesManagementComponent),
		canMatch: [AuthGuard.canMatch],
		data: {
			roles: [Role.ROLE_ADMIN],
		},
	},
	{
		path: 'admin/event-types/:id',
		loadComponent: () =>
			import(
				'../components/admin/event-type-page/event-type-page.component'
				).then((m) => m.EventTypePageComponent),
		canMatch: [AuthGuard.canMatch],
		data: {
			roles: [Role.ROLE_ADMIN],
		},
	},
];
