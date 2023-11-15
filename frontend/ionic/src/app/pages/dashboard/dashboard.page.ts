import { Component, inject, OnInit } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { IonicModule } from '@ionic/angular'
import { CognitoService, IUser } from '../../services/cognito.service'
import { Router } from '@angular/router'
import { Pages } from '../../../enums/Pages'

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class DashboardPage implements OnInit {
  private cognitoService = inject(CognitoService)
  private router = inject(Router)

  constructor() {}

  ngOnInit() {
    this.cognitoService.isAuthenticated().then((response: boolean): void => {
      if (!response) {
        this.router.navigate([`/${Pages.LOGIN}`])
      }
    })
  }

  onLogout() {
    this.cognitoService.getUser().then((user: IUser): void => {
      this.cognitoService.signOut(user).then((): void => {
        this.router.navigate([`/${Pages.LOGIN}`])
      })
    })
  }
}
