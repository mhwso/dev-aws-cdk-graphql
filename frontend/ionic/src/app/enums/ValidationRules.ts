export const ValidationRules: ValidationRules = {
  email: [
    { type: 'required', message: 'ERRORS.REQUIRED_FIELD' },
    { type: 'email', message: 'ERRORS.NOT_AN_EMAIL' },
    { type: 'accountAlreadyExists', message: 'ERRORS.ACCOUNT_ALREADY_EXISTS', custom: true },
    { type: 'invalidData', message: 'ERRORS.INVALID_DATA', custom: true },
    { type: 'emailNotVerified', message: 'ERRORS.EMAIL_NOT_VERIFIED', custom: true },
  ],
  password: [
    { type: 'required', message: 'ERRORS.REQUIRED_FIELD' },
    { type: 'minlength', message: 'ERRORS.INVALID_SIZE' },
    { type: 'wrongPassword', message: 'ERRORS.WRONG_PASSWORD', custom: true },
    { type: 'invalidData', message: 'ERRORS.INVALID_DATA', custom: true },
  ],
  code: [{ type: 'required', message: 'ERRORS.REQUIRED_FIELD' }],
}

export type ValidationRules = {
  [K in ValidationKeys]: ValidationRule[]
}

export type ValidationRule = {
  type: string
  message: string
  custom?: boolean
}

export enum ValidationKeys {
  password = 'password',
  email = 'email',
  code = 'code',
}
