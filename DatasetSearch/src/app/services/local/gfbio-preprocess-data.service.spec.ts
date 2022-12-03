import { TestBed } from '@angular/core/testing';

import { GfbioPreprocessDataService } from './gfbio-preprocess-data.service';

describe('GfbioPreprocessDataService', () => {
  let service: GfbioPreprocessDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GfbioPreprocessDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
