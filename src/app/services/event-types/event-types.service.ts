import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {EventTypeDTO} from '../../types/dto/eventTypeDTO';
import {Page} from "../../types/page";

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
}
