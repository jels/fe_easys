import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonnelAttendance } from './personnel-attendance';

describe('PersonnelAttendance', () => {
  let component: PersonnelAttendance;
  let fixture: ComponentFixture<PersonnelAttendance>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PersonnelAttendance]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PersonnelAttendance);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
