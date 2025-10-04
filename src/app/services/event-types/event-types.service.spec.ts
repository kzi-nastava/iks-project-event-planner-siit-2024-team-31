import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { EventTypesService } from './event-types.service';

describe('EventTypesService', () => {
  let service: EventTypesService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [EventTypesService],
    });
    service = TestBed.inject(EventTypesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
