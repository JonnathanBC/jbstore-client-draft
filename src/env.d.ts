/// <reference path="../.astro/types.d.ts" />

import type { User } from './types/user';

declare global {
  namespace App {
    interface Locals {
      user: User | null;
      isAdmin: boolean;
    }
  }
}

export {};
