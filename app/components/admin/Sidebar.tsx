import { useStore } from '@nanostores/react';
import { Form, Link, useLocation } from 'react-router';
import { LayoutDashboard } from 'lucide-react';
import type { ComponentType, SVGProps } from 'react';
import { cn } from '~/lib/utils';
import { isSidebarOpen } from '~/stores/sidebar.store';

interface MenuItem {
  key: string;
  label: string;
  href: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}

const menuItems: MenuItem[] = [
  { key: 'dashboard', label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { key: 'families', label: 'Familias', href: '/admin/families', icon: LayoutDashboard },
];

export function Sidebar() {
  const open = useStore(isSidebarOpen);
  const { pathname } = useLocation();

  const closeSidebar = () => isSidebarOpen.set(false);

  return (
    <>
      <aside
        className={cn(
          'fixed top-0 left-0 z-40 w-64 h-dvh pt-20 transition-transform bg-white border-r border-gray-100 sm:translate-x-0',
          open ? 'translate-x-0 ease-out' : '-translate-x-full ease-in',
        )}
        aria-label="Sidebar"
      >
        <div className="h-full px-3 pb-4 overflow-y-auto bg-white flex flex-col">
          <ul className="space-y-2 flex-1">
            {menuItems.map((menu) => {
              const Icon = menu.icon;
              const isActive =
                menu.href === '/admin' ? pathname === '/admin' : pathname.startsWith(menu.href);

              return (
                <li key={menu.key}>
                  <Link
                    to={menu.href}
                    onClick={closeSidebar}
                    className={cn(
                      'flex items-center p-2 hover:text-purple-600 rounded-lg hover:bg-purple-100 group',
                      isActive && 'text-purple-600 bg-purple-100',
                    )}
                  >
                    <Icon className="group-hover:text-purple-600 w-5 h-5" />
                    <span className="ms-3">{menu.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>

          <Form method="post" action="/logout" className="mt-4 border-t border-gray-100 pt-4">
            <button
              type="submit"
              className="w-full flex items-center p-2 text-red-600 rounded-lg hover:bg-red-50 cursor-pointer"
            >
              <span className="ms-3">Cerrar sesión</span>
            </button>
          </Form>
        </div>
      </aside>

      <div
        className={cn('fixed inset-0 z-30 bg-black/40 sm:hidden', open ? 'block' : 'hidden')}
        onClick={closeSidebar}
      />
    </>
  );
}
