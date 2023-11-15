import { Injectable } from '@angular/core'
import { BehaviorSubject } from 'rxjs'
import { Amplify, Auth } from 'aws-amplify'
import { environment } from '../../environments/environment'

export interface IUser {
  email: string
  password: string
  code: string
  name: string
}

@Injectable({
  providedIn: 'root',
})
export class CognitoService {
  private authenticationSubject: BehaviorSubject<any>
  constructor() {
    Amplify.configure({
      Auth: environment.cognito,
    })

    this.authenticationSubject = new BehaviorSubject<boolean>(false)
  }

  signUp(user: IUser) {
    return Auth.signUp({
      username: user.email,
      password: user.password,
      attributes: {
        email: user.email,
      },
    })
  }

  confirmSignUp(user: IUser): Promise<unknown> {
    return Auth.confirmSignUp(user.email, user.code)
  }

  async signIn(user: IUser): Promise<void> {
    await Auth.signIn(user.email, user.password)
    this.authenticationSubject.next(true)
  }

  async signOut(user: IUser): Promise<void> {
    await Auth.signOut()
    this.authenticationSubject.next(false)
  }

  async isAuthenticated(): Promise<boolean> {
    if (this.authenticationSubject.value) {
      return Promise.resolve(true)
    } else {
      try {
        let user = await this.getUser()
        return !!user
      } catch (error: unknown) {
        console.log('error', error)
        return false
      }
    }
  }

  getUser(): Promise<any> {
    return Auth.currentUserInfo()
  }
}
