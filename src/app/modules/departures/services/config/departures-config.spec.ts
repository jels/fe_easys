import { TestBed } from '@angular/core/testing';

import { DeparturesConfig } from './departures-config';

describe('DeparturesConfig', () => {
  let service: DeparturesConfig;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DeparturesConfig);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
