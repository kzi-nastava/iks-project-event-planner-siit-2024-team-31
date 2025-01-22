import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditProfileFormComponentComponent } from './edit-profile-form-component.component';

describe('EditProfileFormComponentComponent', () => {
  let component: EditProfileFormComponentComponent;
  let fixture: ComponentFixture<EditProfileFormComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditProfileFormComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditProfileFormComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
