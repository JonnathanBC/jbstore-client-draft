import type { ComponentType, InputHTMLAttributes, SVGProps } from 'react';
import { cn } from '~/lib/utils';

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  name: string;
  label: string;
  type?: 'text' | 'email' | 'password';
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
}

export function Input({ label, name, type = 'text', icon: Icon, className, ...rest }: Props) {
  return (
    <div>
      <label htmlFor={name} className="text-slate-900 text-sm font-medium block">
        <p className="mb-1">{label}</p>
        <div className="relative flex items-center">
          <input
            id={name}
            name={name}
            type={type}
            className={cn(
              'w-full text-sm text-slate-900 border border-slate-300 pl-4 pr-10 py-3 rounded outline-purple-600',
              className,
            )}
            {...rest}
          />
          {Icon ? <Icon className="absolute right-4 w-5 h-5 text-slate-400" /> : null}
        </div>
      </label>
    </div>
  );
}
