import { redirect } from 'react-router';
import type { Route } from './+types/api.auth.google._index';
import { fetchGoogleOAuthUrl } from '~/server/auth.server';

export async function loader(_args: Route.LoaderArgs) {
  const url = await fetchGoogleOAuthUrl();
  return redirect(url);
}
