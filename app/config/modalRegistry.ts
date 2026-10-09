export const modalRegistry = {
  healthy: {
    Component: () => import('~/features/healthy/HealthyModal'),
  },
  productOption: {
    Component: () => import('~/products/options/OptionProductModal'),
  },
  assignDriver: {
    Component: () => import('~/drivers/modals/AssignDriverModal'),
  },
}
