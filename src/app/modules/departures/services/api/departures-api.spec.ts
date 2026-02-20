import { TestBed } from '@angular/core/testing';

import { DeparturesApi } from './departures-api';

describe('DeparturesApi', () => {
  let service: DeparturesApi;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DeparturesApi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
