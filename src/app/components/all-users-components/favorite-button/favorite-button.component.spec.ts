import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FavoriteButtonComponent } from './favorite-button.component';

describe('FavoriteButtonComponent', () => {
  let component: FavoriteButtonComponent;
  let fixture: ComponentFixture<FavoriteButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FavoriteButtonComponent, HttpClientTestingModule],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(FavoriteButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
