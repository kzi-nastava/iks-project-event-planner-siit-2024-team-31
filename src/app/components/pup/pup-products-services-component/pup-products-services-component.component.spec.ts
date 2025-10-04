import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { PupProductsServicesComponent } from './pup-products-services-component.component';

describe('PupProductsServicesComponent', () => {
  let component: PupProductsServicesComponent;
  let fixture: ComponentFixture<PupProductsServicesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PupProductsServicesComponent, HttpClientTestingModule],
      providers: [provideRouter([])],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(PupProductsServicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
