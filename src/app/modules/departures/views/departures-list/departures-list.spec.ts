import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeparturesList } from './departures-list';

describe('DeparturesList', () => {
  let component: DeparturesList;
  let fixture: ComponentFixture<DeparturesList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeparturesList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeparturesList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
