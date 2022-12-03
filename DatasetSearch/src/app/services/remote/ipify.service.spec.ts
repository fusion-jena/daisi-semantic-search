import { TestBed } from '@angular/core/testing';

import { IpifyService } from './ipify.service';

describe('IpifyService', () => {
  let service: IpifyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IpifyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
