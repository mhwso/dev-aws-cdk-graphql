import { Component, inject, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms'
import { IonicModule } from '@ionic/angular'
import { CognitoService, IUser } from '../../services/cognito.service'
import { Router } from '@angular/router'
import { Pages } from '../../../enums/Pages'

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, ReactiveFormsModule],
})
export class RegisterPage implements OnInit {
  private cognitoService = inject(CognitoService)
  private router = inject(Router)
  private fb = inject(FormBuilder)

  form = this.fb.group({
    email: ['', Validators.compose([Validators.required])],
    password: ['', Validators.compose([Validators.required])],
    code: ['', Validators.compose([Validators.required])],
  })

  isConfirm: boolean
  user: IUser
  constructor() {
    this.isConfirm = false
    this.user = {} as IUser
  }

  ngOnInit() {}

  singUp() {
    this.user.email = this.form.value.email || ''
    this.user.password = this.form.value.password || ''

    this.cognitoService
      .signUp(this.user)
      .then(() => {
        this.isConfirm = true
      })
      .catch((error: unknown) => {
        console.log('Error while signup', error)
      })
  }

  confirmSignUp() {
    this.user.code = this.form.value.code || ''

    this.cognitoService
      .confirmSignUp(this.user)
      .then(() => {
        return this.router.navigate([`/${Pages.LOGIN}`])
      })
      .catch((error: unknown) => {
        console.log('Error while confirmSignUp', error)
      })
  }
}
