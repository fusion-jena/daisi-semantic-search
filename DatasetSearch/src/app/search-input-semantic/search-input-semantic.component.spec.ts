import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchInputSemanticComponent } from './search-input-semantic.component';

describe('SearchInputSemanticComponent', () => {
  let component: SearchInputSemanticComponent;
  let fixture: ComponentFixture<SearchInputSemanticComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SearchInputSemanticComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchInputSemanticComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
