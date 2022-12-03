import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GfbioComponent } from './gfbio.component';

describe('GfbioComponent', () => {
  let component: GfbioComponent;
  let fixture: ComponentFixture<GfbioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GfbioComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GfbioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
