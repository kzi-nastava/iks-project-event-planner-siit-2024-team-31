import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceListFilteredComponent } from './service-list-filtered.component';

describe('ServiceListFilteredComponent', () => {
  let component: ServiceListFilteredComponent;
  let fixture: ComponentFixture<ServiceListFilteredComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServiceListFilteredComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServiceListFilteredComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
