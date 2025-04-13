import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgendaCreationComponent } from './agenda-creation.component';

describe('AgendaCreationComponent', () => {
  let component: AgendaCreationComponent;
  let fixture: ComponentFixture<AgendaCreationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgendaCreationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgendaCreationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
