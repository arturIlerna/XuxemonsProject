import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MisXuxemons } from './mis-xuxemons';

describe('MisXuxemons', () => {
  let component: MisXuxemons;
  let fixture: ComponentFixture<MisXuxemons>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MisXuxemons]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MisXuxemons);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
