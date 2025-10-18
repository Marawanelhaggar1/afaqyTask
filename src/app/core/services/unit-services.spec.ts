import { TestBed } from '@angular/core/testing';

import { UnitServices } from './unit-services';

describe('UnitServices', () => {
  let service: UnitServices;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UnitServices);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
