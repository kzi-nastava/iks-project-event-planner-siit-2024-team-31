import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";

@Injectable({
	providedIn: 'root'
})
export class ProductCategoriesService {

	constructor(private http: HttpClient) {
	}

	baseApiUrl = 'http://localhost:3308/product-categories';

	searchProductCategories(keyword: string, page: number, size: number) {
		const headers = {
			'Authorization': 'Bearer ' + localStorage.getItem('token')
		}
		const params = {
			keyword,
			page: (page - 1).toString(),
			size: size.toString()
		}
		return this.http.get(`${this.baseApiUrl}/search`, {
			params,
			headers
		});
	}
}
