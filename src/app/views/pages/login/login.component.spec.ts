import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

// CoreUI & Icons
import { ButtonModule, CardModule, FormModule, GridModule, SpinnerModule } from '@coreui/angular';
import { IconModule, IconSetService } from '@coreui/icons-angular';
import { iconSubset } from '../../../icons/icon-subset';

import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let iconSetService: IconSetService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      // LoginComponent ahora es Standalone, se importa aquí
      imports: [
        LoginComponent, 
        ReactiveFormsModule, 
        RouterTestingModule, 
        HttpClientTestingModule,
        NoopAnimationsModule,
        FormModule, 
        CardModule, 
        GridModule, 
        ButtonModule, 
        IconModule,
        SpinnerModule
      ],
      providers: [IconSetService]
    }).compileComponents();
  });

  beforeEach(() => {
    iconSetService = TestBed.inject(IconSetService);
    iconSetService.icons = { ...iconSubset };

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('debe inicializar el formulario con campos vacíos', () => {
    const loginForm = component.loginForm;
    expect(loginForm.get('email')?.value).toEqual('');
    expect(loginForm.get('password')?.value).toEqual('');
  });

  it('el formulario debe ser inválido si los campos están vacíos', () => {
    component.loginForm.setValue({ email: '', password: '' });
    expect(component.loginForm.invalid).toBeTrue();
  });
});