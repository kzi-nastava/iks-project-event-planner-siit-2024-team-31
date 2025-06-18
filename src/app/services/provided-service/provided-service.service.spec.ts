import { TestBed } from '@angular/core/testing';

import { ProvidedServiceService } from './provided-service.service';

describe('ProvidedServiceService', () => {
  let service: ProvidedServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProvidedServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
