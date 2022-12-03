import { TestBed} from '@angular/core/testing';

import { GraphDbService } from './graph-db.service';

describe('GraphDbService', () => {
  let service: GraphDbService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GraphDbService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
