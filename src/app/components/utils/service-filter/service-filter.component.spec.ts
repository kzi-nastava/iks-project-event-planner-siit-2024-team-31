import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceFilterComponent } from './service-filter.component';

describe('ServiceFilterComponent', () => {
  let component: ServiceFilterComponent;
  let fixture: ComponentFixture<ServiceFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServiceFilterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServiceFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
