import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessReports } from './access-reports';

describe('AccessReports', () => {
  let component: AccessReports;
  let fixture: ComponentFixture<AccessReports>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccessReports]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccessReports);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
