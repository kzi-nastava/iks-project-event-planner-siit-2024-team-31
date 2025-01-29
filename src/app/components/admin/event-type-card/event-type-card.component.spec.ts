import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventTypeCardComponent } from './event-type-card.component';

describe('EventTypeCardComponent', () => {
  let component: EventTypeCardComponent;
  let fixture: ComponentFixture<EventTypeCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventTypeCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventTypeCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
