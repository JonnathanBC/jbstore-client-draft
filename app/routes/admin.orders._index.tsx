import { Route } from './+types/admin.orders._index'

export const meta: Route.MetaFunction = () => [{ title: '' }]

export async function loader({ request }: Route.LoaderArgs) {}

export async function action({ request }: Route.ActionArgs) {}

export default function OrdersPage({ loaderData }: Route.ComponentProps) {
  return <div>Ordenes</div>
}
