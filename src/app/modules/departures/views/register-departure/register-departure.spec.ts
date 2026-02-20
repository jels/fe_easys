import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterDeparture } from './register-departure';

describe('RegisterDeparture', () => {
  let component: RegisterDeparture;
  let fixture: ComponentFixture<RegisterDeparture>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterDeparture]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegisterDeparture);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
