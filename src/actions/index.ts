import { loginAction } from './auth/login';
import { registerUser } from './auth/register';

export const server = {
  loginAction: loginAction,
  registerUser: registerUser,
};
