import { createFamily } from './admin/families/create-family.action';
import { getFamiliesAction } from './admin/families/get-families.action';
import { getFamily } from './admin/families/get-family.action';
import { updateFamily } from './admin/families/update-family.action';
import { loginAction } from './auth/login.action';
import { logoutAction } from './auth/logout.action';
import { registerUser } from './auth/register.action';

export const server = {
  loginAction: loginAction,
  logoutAction: logoutAction,
  registerUser: registerUser,

  // families
  getFamilies: getFamiliesAction,
  createFamily: createFamily,
  getFamily: getFamily,
  updateFamily: updateFamily,
};
