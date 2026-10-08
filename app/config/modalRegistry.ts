export const modalRegistry = {
  healthy: {
    Component: () => import('~/features/healthy/HealthyModal'),
  },
  option: {
    Component: () => import('~/features/options/OptionForm'),
  },
  driver: {
    Component: () => import('~/features/drivers/DriverModal'),
  },
  productOption: {
    Component: () => import('~/products/options/OptionProductModal'),
  },
}
