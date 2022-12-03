import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Biodiv2Component } from './biodiv2.component';

describe('Biodiv2Component', () => {
  let component: Biodiv2Component;
  let fixture: ComponentFixture<Biodiv2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ Biodiv2Component ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(Biodiv2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
