import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SingleorderPage } from './singleorder.page';

describe('SingleorderPage', () => {
  let component: SingleorderPage;
  let fixture: ComponentFixture<SingleorderPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SingleorderPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SingleorderPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
