import { TestBed } from '@angular/core/testing';

import { InputAnalysisService } from './input-analysis.service';

describe('InputAnalysisService', () => {
  let service: InputAnalysisService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InputAnalysisService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
