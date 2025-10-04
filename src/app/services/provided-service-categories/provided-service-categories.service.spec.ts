import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { ProvidedServiceCategoriesService } from './provided-service-categories.service';

describe('ProvidedServiceCategoriesService', () => {
  let service: ProvidedServiceCategoriesService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProvidedServiceCategoriesService],
    });
    service = TestBed.inject(ProvidedServiceCategoriesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
