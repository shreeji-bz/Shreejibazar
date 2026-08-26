export class LoginDto {
  mobile!: string;
  password!: string;
}

export class RegisterDto {
  name!: string;
  mobile!: string;
  email!: string;
  password!: string;
  referralCode?: string;
}
