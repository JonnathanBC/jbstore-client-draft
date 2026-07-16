import { getPublicFamilies } from '~/server/api.server'

export async function loader() {
  const families = await getPublicFamilies({
    page: 1,
    pagination: false,
  })

  return {
    items: families?.data?.map((f) => ({
      value: String(f.id),
      label: f.name,
    })),
  }
}
