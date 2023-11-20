import { inject } from '@angular/core'
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router'
import { Pages } from '../enums/Pages'
import { CognitoService } from '../services/cognito.service'

export const AuthGuard: CanActivateFn = async (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
): Promise<boolean> => {
  const cognitoService = inject(CognitoService)

  const router: Router = inject(Router)

  const allowed = await cognitoService.isAuthenticated()

  if (!allowed) {
    const navigation = router.getCurrentNavigation()
    let url = Pages.LOGIN.valueOf()

    if (navigation) {
      url = navigation.extractedUrl.toString()
    }

    router.navigate([`/${Pages.LOGIN}`], { queryParams: { returnTo: url } }).then(() => {
      return false
    })
  }

  return true
}
