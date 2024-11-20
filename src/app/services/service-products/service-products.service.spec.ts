import { TestBed } from '@angular/core/testing';

import { ServiceProductService } from './service-products.service';

describe('ServiceProductsService', () => {
  let service: ServiceProductService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ServiceProductService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
