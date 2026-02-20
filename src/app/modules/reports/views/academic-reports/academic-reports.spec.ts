import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AcademicReports } from './academic-reports';

describe('AcademicReports', () => {
  let component: AcademicReports;
  let fixture: ComponentFixture<AcademicReports>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AcademicReports]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AcademicReports);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
