import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PromosPage } from './promos.page';

describe('PromosPage', () => {
  let component: PromosPage;
  let fixture: ComponentFixture<PromosPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PromosPage],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(PromosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
