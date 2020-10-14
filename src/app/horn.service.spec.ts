import { TestBed } from '@angular/core/testing';

import { HornService } from './horn.service';

describe('HornService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: HornService = TestBed.get(HornService);
    expect(service).toBeTruthy();
  });
});
