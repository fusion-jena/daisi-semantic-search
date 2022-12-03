import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContextBoxComponent } from './context-box.component';

describe('ContextBoxComponent', () => {
  let component: ContextBoxComponent;
  let fixture: ComponentFixture<ContextBoxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ContextBoxComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ContextBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
