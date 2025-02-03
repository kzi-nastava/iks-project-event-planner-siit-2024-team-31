import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {ProductCategoryDTO} from "../../types/dto/productCategoryDTO";
import {Page} from "../../types/page";
import {baseUrl} from "../baseUrl";

@Injectable({
	providedIn: 'root'
})
export class ProductCategoriesService {

	constructor(private http: HttpClient) {
	}

	baseApiUrl = baseUrl + 'product-categories';

	searchProductCategories(keyword: string, page: number, size: number): Observable<Page<ProductCategoryDTO>> {
		const headers = {
			'Authorization': 'Bearer ' + localStorage.getItem('token')
		}
		const params = {
			keyword,
			page: (page - 1).toString(),
			size: size.toString()
		}
		return this.http.get<Page<ProductCategoryDTO>>(`${this.baseApiUrl}/search`, {
			params,
			headers
		});
	}
}
