import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventFilterComponent } from './event-filter.component';

describe('EventFilterComponent', () => {
  let component: EventFilterComponent;
  let fixture: ComponentFixture<EventFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventFilterComponent, HttpClientTestingModule],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(EventFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
