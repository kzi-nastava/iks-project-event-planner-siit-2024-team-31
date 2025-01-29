import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventTypesManagementComponent } from './event-types-management.component';

describe('EventTypesManagementComponent', () => {
  let component: EventTypesManagementComponent;
  let fixture: ComponentFixture<EventTypesManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventTypesManagementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventTypesManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
