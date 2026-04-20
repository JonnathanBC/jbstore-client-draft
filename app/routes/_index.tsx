import type { Route } from './+types/_index';

export const meta: Route.MetaFunction = () => [{ title: 'JB Store' }];

export default function HomeIndex() {
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold">Jb Store</h1>
    </main>
  );
}
