import { Button } from '@/components/ui/button';

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import type { JSX } from 'react';

type Props = {
  open: boolean;
  setOpen: (open: boolean) => void;
  children: JSX.Element;
};

export function CrudDialog({ open, setOpen, children }: Props) {
  return (
    <Dialog open={open} modal={true} onOpenChange={setOpen}>
      <div>
        <DialogTrigger asChild>
          <Button variant="outline">Open Dialog</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader className="flex items-center gap-4">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">Save changes</Button>
            <DialogTitle>Edit profile</DialogTitle>
            {children}
          </DialogHeader>
        </DialogContent>
      </div>
    </Dialog>
  );
}
