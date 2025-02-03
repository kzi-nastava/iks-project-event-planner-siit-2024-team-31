import {AuthGuard} from '../services/auth/auth.guard';
import {Role} from "../types/roles";

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
				Role.ROLE_OD,
				//admin for testing purposes!
				Role.ROLE_ADMIN
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
				Role.ROLE_OD,
				//admin for testing purposes!
				Role.ROLE_ADMIN
			],
		},
	},
];
