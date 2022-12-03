import { TestBed } from '@angular/core/testing';

import { BiodivPreprocessDataService } from './biodiv-preprocess-data.service';

describe('BiodivPreprocessDataService', () => {
  let service: BiodivPreprocessDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BiodivPreprocessDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
