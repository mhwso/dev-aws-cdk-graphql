import { Component, inject, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms'
import { IonicModule } from '@ionic/angular'
import { Router, RouterLink } from '@angular/router'
import { CognitoService, IUser } from '../../services/cognito.service'
import { Pages } from '../../../enums/Pages'

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterLink, ReactiveFormsModule],
})
export class LoginPage implements OnInit {
  private cognitoService = inject(CognitoService)
  private fb = inject(FormBuilder)
  private router = inject(Router)

  user: IUser

  form = this.fb.group({
    email: ['', Validators.compose([Validators.required])],
    password: ['', Validators.compose([Validators.required])],
  })
  constructor() {
    this.user = {} as IUser
  }

  ngOnInit() {
    this.cognitoService.isAuthenticated().then((response: boolean): void => {
      if (response) {
        this.router.navigate([`/${Pages.DASHBOARD}`])
      }
    })
  }

  signIn() {
    this.user.email = this.form.value.email || ''
    this.user.password = this.form.value.password || ''

    this.cognitoService.signIn(this.user).then(() => {
      this.cognitoService.getUser().then((result: any) => {
        console.log('user', result)
        return this.router.navigate([`/${Pages.DASHBOARD}`])
      })
    })
  }
}