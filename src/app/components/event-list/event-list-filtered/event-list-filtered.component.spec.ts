import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventListFilteredComponent } from './event-list-filtered.component';

describe('EventListFilteredComponent', () => {
  let component: EventListFilteredComponent;
  let fixture: ComponentFixture<EventListFilteredComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventListFilteredComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventListFilteredComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
