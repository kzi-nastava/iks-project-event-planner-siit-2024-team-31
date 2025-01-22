import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OdEventsComponentComponent } from './od-events-component.component';

describe('OdEventsComponentComponent', () => {
  let component: OdEventsComponentComponent;
  let fixture: ComponentFixture<OdEventsComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OdEventsComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OdEventsComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
