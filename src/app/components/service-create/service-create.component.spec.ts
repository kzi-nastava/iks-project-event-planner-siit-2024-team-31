import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateServiceProductComponent } from './service-create.component';

describe('ServiceAddComponent', () => {
  let component: CreateServiceProductComponent;
  let fixture: ComponentFixture<CreateServiceProductComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateServiceProductComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateServiceProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
