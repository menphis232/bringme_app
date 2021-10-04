import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CgvPage } from './cgv.page';

describe('CgvPage', () => {
  let component: CgvPage;
  let fixture: ComponentFixture<CgvPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CgvPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CgvPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
