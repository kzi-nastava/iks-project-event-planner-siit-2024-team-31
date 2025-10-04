import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventTypesManagementComponent } from './event-types-management.component';

describe('EventTypesManagementComponent', () => {
  let component: EventTypesManagementComponent;
  let fixture: ComponentFixture<EventTypesManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventTypesManagementComponent, HttpClientTestingModule],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(EventTypesManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
