import type { Route } from './+types/_app._index'

export const meta: Route.MetaFunction = () => [{ title: 'JB Store' }]

export default function HomeIndex() {
  return <h1 className="text-3xl font-semibold">Jb Store</h1>
}
