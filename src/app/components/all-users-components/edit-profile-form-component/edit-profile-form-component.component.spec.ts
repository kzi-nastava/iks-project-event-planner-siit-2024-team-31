import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditProfileFormComponent } from './edit-profile-form-component.component';

describe('EditProfileFormComponent', () => {
  let component: EditProfileFormComponent;
  let fixture: ComponentFixture<EditProfileFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditProfileFormComponent, HttpClientTestingModule],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(EditProfileFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
