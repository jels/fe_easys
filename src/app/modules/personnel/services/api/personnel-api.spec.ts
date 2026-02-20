import { TestBed } from '@angular/core/testing';

import { PersonnelApi } from './personnel-api';

describe('PersonnelApi', () => {
  let service: PersonnelApi;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PersonnelApi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
