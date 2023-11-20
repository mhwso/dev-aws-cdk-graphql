import { Component, inject, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms'
import { Router, RouterLink } from '@angular/router'
import { CognitoService, IUser } from '../../services/cognito.service'
import { Pages } from '../../enums/Pages'
import {
  IonButton,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonList,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone'
import { ValidationRules } from '../../enums/ValidationRules'
import { ErrorContainerComponent } from '../../components/error-container/error-container.component'

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    ReactiveFormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonInput,
    IonButton,
    IonText,
    IonSpinner,
    ErrorContainerComponent,
  ],
})
export class LoginPage implements OnInit {
  private cognitoService = inject(CognitoService)
  private formBuilder = inject(FormBuilder)
  private router = inject(Router)

  user: IUser
  form: FormGroup
  isSubmitting = false
  constructor() {
    this.user = {} as IUser

    this.form = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    })
  }

  ngOnInit() {
    this.cognitoService.isAuthenticated().then((response: boolean): void => {
      if (response) {
        this.router.navigate([`/${Pages.DASHBOARD}`])
      }
    })
  }

  signIn() {
    this.isSubmitting = true
    if (!this.form.valid) {
      return
    }

    this.user.email = this.form.value.email || ''
    this.user.password = this.form.value.password || ''

    this.cognitoService
      .signIn(this.user)
      .then(() => {
        this.cognitoService.getUser().then((result: unknown) => {
          return this.router.navigate([`/${Pages.DASHBOARD}`])
        })
      })
      .catch((error: unknown) => {
        console.log('error', error)
        this.form.controls['email'].setErrors({ invalidData: true })
        this.form.controls['password'].setErrors({ invalidData: true })
        this.isSubmitting = false
      })
  }
}
