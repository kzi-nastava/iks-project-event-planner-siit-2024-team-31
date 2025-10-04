import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { EventTypePageComponent } from './event-type-page.component';

describe('EventTypePageComponent', () => {
  let component: EventTypePageComponent;
  let fixture: ComponentFixture<EventTypePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventTypePageComponent, HttpClientTestingModule],
      providers: [provideRouter([])],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(EventTypePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
