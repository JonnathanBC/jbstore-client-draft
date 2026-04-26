import { Form, Link } from 'react-router';
import { ShoppingCart } from 'lucide-react';
import type { User } from '~/types/user';

interface Props {
  user: User | null;
  isAdmin: boolean;
}

export function Header({ user, isAdmin }: Props) {
  return (
    <header className="h-16 border-b bg-white flex items-center px-6">
      <div className="flex items-center justify-between w-full max-w-7xl mx-auto">
        <Link to="/" className="font-semibold text-lg">
          JB Store
        </Link>

        <nav className="flex items-center gap-6 text-sm">
          <Link to="/products" className="hover:text-black">
            Productos
          </Link>
          {isAdmin && (
            <Link to="/admin" className="hover:text-black">
              Admin
            </Link>
          )}

          {user ? (
            <Form method="post" action="/logout">
              <button type="submit" className="hover:text-black cursor-pointer">
                Cerrar sesión
              </button>
            </Form>
          ) : (
            <Link to="/login" className="hover:text-black">
              Iniciar sesión
            </Link>
          )}

          <Link to="/cart" className="hover:text-black" aria-label="Cart">
            <ShoppingCart className="w-5 h-5" />
          </Link>
        </nav>
      </div>
    </header>
  );
}
