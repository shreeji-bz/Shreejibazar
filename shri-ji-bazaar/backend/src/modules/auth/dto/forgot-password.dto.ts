export class ForgotPasswordDto {
  email?: string;
}

export class ResetPasswordDto {
  token?: string;
  password?: string;
  confirmPassword?: string;
}
