import { TestBed } from '@angular/core/testing';

import { SemanticAssistantService } from './semantic-assistant.service';

describe('SemanticAssistantService', () => {
  let service: SemanticAssistantService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SemanticAssistantService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
