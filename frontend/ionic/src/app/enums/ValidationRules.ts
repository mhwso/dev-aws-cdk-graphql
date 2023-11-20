export const ValidationRules: ValidationRules = {
  email: [
    { type: 'required', message: 'ERRORS.REQUIRED_FIELD' },
    { type: 'email', message: 'ERRORS.NOT_AN_EMAIL' },
    { type: 'accountNotFound', message: 'ERRORS.ACCOUNT_NOT_FOUND', custom: true },
    { type: 'invalidData', message: 'ERRORS.INVALID_DATA', custom: true },
    { type: 'emailNotVerified', message: 'ERRORS.EMAIL_NOT_VERIFIED', custom: true },
  ],
  password: [
    { type: 'required', message: 'ERRORS.REQUIRED_FIELD' },
    { type: 'minlength', message: 'ERRORS.INVALID_SIZE' },
    { type: 'wrongPassword', message: 'ERRORS.WRONG_PASSWORD', custom: true },
    { type: 'invalidData', message: 'ERRORS.INVALID_DATA', custom: true },
  ],
}

export type ValidationRules = {
  [key in ValidationKeys]: ValidationRule[]
}

type ValidationRule = {
  type: string
  message: string
  custom?: boolean
}

enum ValidationKeys {
  password = 'password',
  email = 'email',
}
