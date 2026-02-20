import { TestBed } from '@angular/core/testing';

import { ReportsApi } from './reports-api';

describe('ReportsApi', () => {
  let service: ReportsApi;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReportsApi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
