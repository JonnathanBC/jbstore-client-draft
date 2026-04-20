import { redirect } from 'react-router';
import type { Route } from './+types/api.auth.google.callback';
import { fetchMe } from '~/server/auth.server';
import { commitSession, getSession } from '~/server/session.server';

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const token = url.searchParams.get('token');

  if (!token) {
    return redirect('/login');
  }

  const user = await fetchMe(token);
  const session = await getSession(request.headers.get('Cookie'));
  session.set('token', token);
  session.set('userId', user.id);

  return redirect('/', {
    headers: { 'Set-Cookie': await commitSession(session) },
  });
}
