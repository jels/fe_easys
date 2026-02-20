import { TestBed } from '@angular/core/testing';

import { PersonnelConfig } from './personnel-config';

describe('PersonnelConfig', () => {
  let service: PersonnelConfig;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PersonnelConfig);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
