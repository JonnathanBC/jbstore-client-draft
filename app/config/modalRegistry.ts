export const modalRegistry = {
  healthy: {
    Component: () => import('~/features/healthy/HealthyModal'),
  },
  option: {
    Component: () => import('~/features/options/OptionForm'),
  },
  productOption: {
    Component: () => import('~/products/options/OptionProductModal'),
  },
}
