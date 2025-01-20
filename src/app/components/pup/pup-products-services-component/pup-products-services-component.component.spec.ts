import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PupProductsServicesComponentComponent } from './pup-products-services-component.component';

describe('PupProductsServicesComponentComponent', () => {
  let component: PupProductsServicesComponentComponent;
  let fixture: ComponentFixture<PupProductsServicesComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PupProductsServicesComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PupProductsServicesComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
