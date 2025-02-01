import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {EventTypeDTO} from '../../types/dto/eventTypeDTO';
import {Page} from "../../types/page";
import {
	CommonMessageResponse
} from "../../types/dto/responses/commonMessageResponse";
import {EventTypeFullDTO} from "../../types/dto/eventTypeFullDTO";
import {baseUrl} from "../baseUrl";

@Injectable({
	providedIn: 'root',
})
export class EventTypesService {
	constructor(private http: HttpClient) {
	}

	private baseApiUrl = baseUrl + 'event-types';

	searchEventTypes(keyword: string, page: number, size: number): Observable<Page<EventTypeDTO>> {

		const headers = {
			'Authorization': 'Bearer ' + localStorage.getItem('token')
		};

		const params = {
			keyword,
			page: (page - 1).toString(),
			size: size.toString(),
		};

		return this.http.get<Page<EventTypeDTO>>(`${this.baseApiUrl}/search`, {
			params,
			headers
		});
	}

	createEventType(eventType: EventTypeFullDTO): Observable<CommonMessageResponse> {
		const headers = {
			'Authorization': 'Bearer ' + localStorage.getItem('token')
		};

		return this.http.post<CommonMessageResponse>(`${this.baseApiUrl}/create`, eventType, {headers});
	}

	getEventTypeById(id: number): Observable<EventTypeFullDTO> {
		const headers = {
			'Authorization': 'Bearer ' + localStorage.getItem('token')
		};
		return this.http.get<EventTypeFullDTO>(`${this.baseApiUrl}/${id}`, {headers});
	}

	switchEventTypeStatus(id: number, newStatus: boolean): Observable<CommonMessageResponse> {
		const headers = {
			'Authorization': 'Bearer ' + localStorage.getItem('token')
		};

		return this.http.put<CommonMessageResponse>(
			`${this.baseApiUrl}/set-status/${id}`,
			{status: newStatus},
			{headers}
		);
	}

	updateEventType(id: number, eventType: EventTypeFullDTO): Observable<CommonMessageResponse> {
		const headers = {
			'Authorization': 'Bearer ' + localStorage.getItem('token')
		};
		return this.http.put<CommonMessageResponse>(
			`${this.baseApiUrl}/update/${id}`,
			eventType,
			{headers}
		);
	}

}
