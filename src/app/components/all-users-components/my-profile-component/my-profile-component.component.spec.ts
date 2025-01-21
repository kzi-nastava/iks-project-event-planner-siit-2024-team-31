import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyProfileComponentComponent } from './my-profile-component.component';

describe('MyProfileComponentComponent', () => {
  let component: MyProfileComponentComponent;
  let fixture: ComponentFixture<MyProfileComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyProfileComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyProfileComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
