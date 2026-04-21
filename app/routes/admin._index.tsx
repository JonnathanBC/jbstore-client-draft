import { User as UserIcon } from 'lucide-react';
import { useRouteLoaderData } from 'react-router';
import type { Route } from './+types/admin._index';
import type { loader as adminLoader } from './admin';
import { t } from '~/i18n';
import type { RouteHandle } from '~/types/route';

export const handle: RouteHandle = { breadcrumb: t('admin.dashboard') };

export const meta: Route.MetaFunction = () => [{ title: `${t('admin.dashboard')} | JB Store` }];

export default function AdminDashboard() {
  const parent = useRouteLoaderData<typeof adminLoader>('routes/admin');
  const user = parent?.user;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center">
          <div className="flex items-center justify-center size-10 rounded-full bg-weak">
            <UserIcon />
          </div>
          <div className="ml-4 flex-1">
            <h2 className="text-lg">
              {t('global.welcome')}, {user?.name ?? 'User'}
            </h2>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-lg p-6 text-center">
        <h2 className="text-lg font-semibold">JB Store</h2>
      </div>
    </div>
  );
}
