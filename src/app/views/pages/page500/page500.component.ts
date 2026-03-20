import { Component } from '@angular/core';
import { IconDirective } from '@coreui/icons-angular';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { NgIf } from '@angular/common';
import {
  ButtonDirective,
  ColComponent,
  ContainerComponent,
  FormControlDirective,
  InputGroupComponent,
  InputGroupTextDirective,
  RowComponent,
  CardGroupComponent,
  CardComponent,
  CardBodyComponent,
  FormDirective,
  FormFeedbackComponent
} from '@coreui/angular';

@Component({
  selector: 'app-page500',
  templateUrl: './page500.component.html',
  imports: [
    ContainerComponent, RowComponent, ColComponent, InputGroupComponent, InputGroupTextDirective, 
    IconDirective, FormControlDirective, ButtonDirective,
    ReactiveFormsModule, NgIf, CardGroupComponent, CardComponent, CardBodyComponent, FormDirective, FormFeedbackComponent
  ]
})
export class Page500Component {
  loading = false;
  errorMessage = '';

  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required])
  });

  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }

  onSubmit() {
    // Lógica de envío
  }
}
