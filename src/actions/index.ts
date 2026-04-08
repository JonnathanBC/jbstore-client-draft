import { loginAction } from './auth/login.action';
import { registerUser } from './auth/register.action';

export const server = {
  loginAction: loginAction,
  registerUser: registerUser,
};
