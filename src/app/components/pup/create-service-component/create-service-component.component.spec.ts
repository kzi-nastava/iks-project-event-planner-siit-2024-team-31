import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateServiceComponentComponent } from './create-service-component.component';

describe('CreateServiceComponentComponent', () => {
  let component: CreateServiceComponentComponent;
  let fixture: ComponentFixture<CreateServiceComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateServiceComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateServiceComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
