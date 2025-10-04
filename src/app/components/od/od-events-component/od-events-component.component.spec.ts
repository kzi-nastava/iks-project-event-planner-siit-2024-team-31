import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { OdEventsComponent } from './od-events-component.component';

describe('OdEventsComponent', () => {
  let component: OdEventsComponent;
  let fixture: ComponentFixture<OdEventsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OdEventsComponent, HttpClientTestingModule],
      providers: [provideRouter([])],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(OdEventsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
