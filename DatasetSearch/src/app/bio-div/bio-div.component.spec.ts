import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BioDivComponent } from './bio-div.component';

describe('BioDivComponent', () => {
  let component: BioDivComponent;
  let fixture: ComponentFixture<BioDivComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BioDivComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BioDivComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
