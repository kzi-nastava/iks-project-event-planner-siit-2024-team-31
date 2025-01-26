import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventTypePageComponent } from './event-type-page.component';

describe('EventTypePageComponent', () => {
  let component: EventTypePageComponent;
  let fixture: ComponentFixture<EventTypePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventTypePageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventTypePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
