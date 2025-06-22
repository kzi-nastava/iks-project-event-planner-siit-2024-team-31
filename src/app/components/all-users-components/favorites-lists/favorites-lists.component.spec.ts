import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FavoritesListsComponent } from './favorites-lists.component';

describe('FavoritesListsComponent', () => {
  let component: FavoritesListsComponent;
  let fixture: ComponentFixture<FavoritesListsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FavoritesListsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FavoritesListsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
