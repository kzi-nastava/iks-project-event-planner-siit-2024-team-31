import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FavoritesListsComponent } from './favorites-lists.component';

describe('FavoritesListsComponent', () => {
  let component: FavoritesListsComponent;
  let fixture: ComponentFixture<FavoritesListsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FavoritesListsComponent, HttpClientTestingModule],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(FavoritesListsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
