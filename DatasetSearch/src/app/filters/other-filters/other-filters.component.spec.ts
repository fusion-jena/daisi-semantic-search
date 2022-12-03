import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtherFiltersComponent } from './other-filters.component';

describe('OtherFiltersComponent', () => {
  let component: OtherFiltersComponent;
  let fixture: ComponentFixture<OtherFiltersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OtherFiltersComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OtherFiltersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
