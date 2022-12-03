import { TestBed } from '@angular/core/testing';

import { StartSearchingService } from './start-searching.service';

describe('StartSearchingService', () => {
  let service: StartSearchingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StartSearchingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
