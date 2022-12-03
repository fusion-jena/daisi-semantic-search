import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterDatePickerComponent } from './filter-date-picker.component';

describe('FilterDatePickerComponent', () => {
  let component: FilterDatePickerComponent;
  let fixture: ComponentFixture<FilterDatePickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FilterDatePickerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FilterDatePickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
