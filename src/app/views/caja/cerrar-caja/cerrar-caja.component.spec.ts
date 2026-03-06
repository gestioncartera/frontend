import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CerrarCajaComponent } from './cerrar-caja.component';

describe('CerrarCajaComponent', () => {
  let component: CerrarCajaComponent;
  let fixture: ComponentFixture<CerrarCajaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CerrarCajaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CerrarCajaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
