import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DepartureAuthorization } from './departure-authorization';

describe('DepartureAuthorization', () => {
  let component: DepartureAuthorization;
  let fixture: ComponentFixture<DepartureAuthorization>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DepartureAuthorization]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DepartureAuthorization);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
