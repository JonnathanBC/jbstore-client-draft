import { lazy, type ComponentType } from 'react';

export const modalRegistry: Record<string, { Component: ComponentType<any> }> = {
  family: {
    Component: lazy(() =>
      import('@/screens/families/FamilyForm').then((m) => ({ default: m.FamilyForm })),
    ),
  },
};
