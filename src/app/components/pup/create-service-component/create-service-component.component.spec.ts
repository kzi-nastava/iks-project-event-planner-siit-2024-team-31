import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateServiceComponent } from './create-service-component.component';

describe('CreateServiceComponent', () => {
  let component: CreateServiceComponent;
  let fixture: ComponentFixture<CreateServiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateServiceComponent, HttpClientTestingModule],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateServiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
