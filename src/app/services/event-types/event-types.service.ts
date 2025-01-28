import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {EventTypeDTO} from '../../types/dto/eventTypeDTO';
import {Page} from "../../types/page";
import {
	CommonMessageResponse
} from "../../types/dto/responses/commonMessageResponse";
import {EventTypeFullDTO} from "../../types/dto/eventTypeFullDTO";

@Injectable({
	providedIn: 'root',
})
export class EventTypesService {
	constructor(private http: HttpClient) {
	}

	private baseApiUrl = 'http://localhost:3308/event-types';

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

	updateEventTypeStatus(id: number, newStatus: string): Observable<CommonMessageResponse> {
		const headers = {
			'Authorization': 'Bearer ' + localStorage.getItem('token')
		};
		return this.http.patch<CommonMessageResponse>(
			`${this.baseApiUrl}/${id}/status`,
			{newStatus},
			{headers}
		);
	}

}
