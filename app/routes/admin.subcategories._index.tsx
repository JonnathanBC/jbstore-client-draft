import { Link, useSearchParams } from 'react-router';

import { Table } from '~/components/Table';
import { t } from '~/i18n';
import { requireAuth } from '~/server/auth.server';
import { getSubCategories } from '~/server/subcategories.server';
import type { RouteHandle } from '~/types/route';
import type { Route } from './+types/admin.subcategories._index';
import { SubCategory } from '~/types/subcategory';
import { Category } from '~/types/category';
import { Column } from '~/types/table';

export const handle: RouteHandle = { breadcrumb: t('admin.subcategories') };

export const meta: Route.MetaFunction = () => [
  { title: `${t('admin.subcategories')} | JB Store` },
];

export async function loader({ request }: Route.LoaderArgs) {
  const { token } = await requireAuth(request);
  const url = new URL(request.url);
  const page = Number(url.searchParams.get('page') ?? 1);
  const per_page = Number(url.searchParams.get('per_page') ?? 10);

  const subcategories = await getSubCategories({
    token,
    page,
    per_page,
    order: { updated_at: 'desc' },
  });

  return { subcategories };
}

const columns: Column<SubCategory>[] = [
  { title: 'ID', dataIndex: 'id' },
  { title: 'Name', dataIndex: 'name' },
  { title: 'Categoria', dataIndex: 'category', render: (row: SubCategory) => (
    <p>{row?.category?.name}</p>
  )},
  {
    title: 'Familia',
    render: (row: SubCategory) => (
      <p>{row?.category?.family?.name}</p>
    ),
  },
  {
    title: 'Acciones',
    render: (row: SubCategory) => (
      <Link to={`/admin/subcategories/${row.id}`} className="text-primary hover:underline text-sm">
        {t('global.edit')}
      </Link>
    ),
  },
];

export default function SubCategoriesIndex({ loaderData }: Route.ComponentProps) {
  const { subcategories } = loaderData;
  const [searchParams, setSearchParams] = useSearchParams();

  const handlePageChange = (page: number) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(page));
    setSearchParams(next);
  };

  return (
    <>
      <div className="text-right mb-4">
        <Link to="/admin/subcategories/create" className="btn btn-primary">
          {t('global.new')}
        </Link>
      </div>

      <Table<SubCategory>
        dataSource={subcategories.data}
        columns={columns}
        meta={subcategories}
        onPageChange={handlePageChange}
      />
    </>
  );
}
