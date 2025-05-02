import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FurnitureAddFormComponent } from './furniture-add-form.component';

describe('FurnitureAddFormComponent', () => {
  let component: FurnitureAddFormComponent;
  let fixture: ComponentFixture<FurnitureAddFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FurnitureAddFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FurnitureAddFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
