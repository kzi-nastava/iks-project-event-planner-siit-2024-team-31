import {Role} from "./roles";

export interface CurrentUser {
	token: string;
	role: Role;
}
