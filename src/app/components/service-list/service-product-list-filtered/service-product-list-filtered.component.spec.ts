import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceProductListFilteredComponent } from './service-product-list-filtered.component';

describe('ServiceProductListFilteredComponent', () => {
  let component: ServiceProductListFilteredComponent;
  let fixture: ComponentFixture<ServiceProductListFilteredComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServiceProductListFilteredComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ServiceProductListFilteredComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
