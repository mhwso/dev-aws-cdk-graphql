import { Component, inject, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms'
import { CognitoService, IUser } from '../../services/cognito.service'
import { Router } from '@angular/router'
import { Pages } from '../../enums/Pages'
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonList,
  IonSpinner,
  IonText,
  IonTitle,
  IonToggle,
  IonToolbar,
} from '@ionic/angular/standalone'
import { ErrorContainerComponent } from '../../components/error-container/error-container.component'

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonInput,
    IonButton,
    IonCard,
    IonCardHeader,
    IonCardContent,
    IonText,
    ErrorContainerComponent,
    IonSpinner,
    IonToggle,
  ],
})
export class RegisterPage implements OnInit {
  private cognitoService = inject(CognitoService)
  private router = inject(Router)
  private formBuilder = inject(FormBuilder)

  isConfirm: boolean
  user: IUser
  form: FormGroup
  isSubmitting = false
  toggleConfirm = false

  constructor() {
    this.isConfirm = false
    this.user = {} as IUser

    this.form = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      code: ['', [Validators.required, Validators.maxLength(6)]],
    })
  }

  ngOnInit() {}

  singUp() {
    this.isSubmitting = true
    if (!this.form.valid) {
      return
    }

    this.user.email = this.form.value.email || ''
    this.user.password = this.form.value.password || ''

    this.cognitoService
      .signUp(this.user)
      .then(() => {
        this.isConfirm = true
      })
      .catch((error: Error) => {
        console.log('error', error)
        switch (error.name) {
          case 'UsernameExistsException':
            this.form.controls['email'].setErrors({ accountAlreadyExists: true })
            break
          case 'InvalidPasswordException':
            this.form.controls['password'].setErrors({ invalidData: true })
            break
          default:
            this.form.controls['email'].setErrors({ invalidData: true })
            this.form.controls['password'].setErrors({ invalidData: true })
        }
      })
      .finally(() => {
        this.isSubmitting = false
      })
  }

  confirmSignUp() {
    this.isSubmitting = true
    this.user.code = this.form.value.code || ''

    this.cognitoService
      .confirmSignUp(this.user)
      .then(() => {
        return this.router.navigate([`/${Pages.LOGIN}`])
      })
      .catch((error: unknown) => {
        this.form.controls['code'].setErrors({ invalidData: true })
        this.isSubmitting = false
      })
  }

  onToggleCode() {
    this.toggleConfirm = !this.toggleConfirm
  }

  protected readonly toolbar = toolbar
}
