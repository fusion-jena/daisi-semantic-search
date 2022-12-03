import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BasketDialogComponent } from "./BasketDialogComponent";

describe('BasketDialogComponent', () => {
  let component: BasketDialogComponent;
  let fixture: ComponentFixture<BasketDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BasketDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BasketDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
