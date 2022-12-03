import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuggestionWindowComponent } from './suggestion-window.component';

describe('SuggestionWindowComponent', () => {
  let component: SuggestionWindowComponent;
  let fixture: ComponentFixture<SuggestionWindowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SuggestionWindowComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SuggestionWindowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
