import { AsyncSelect } from '~/components/inputs/AsyncSelect'
import { Field } from '~/components/inputs/Field'
import { Select } from '~/components/inputs/Select'
import { t } from '~/i18n'
import { Driver } from '~/types/driver'

const TYPE_ITEMS = [
  { value: 'car', label: 'Auto' },
  { value: 'motorcycle', label: 'Moto' },
]

export const toDriverFormValues = (driver?: Driver) => ({
  user_id: driver ? String(driver.user_id) : '',
  type: driver?.type ?? '',
  license_plate: driver?.license_plate ?? '',
})

export const DriverFields = () => (
  <div className="grid gap-4 md:grid-cols-2">
    <Field
      label="Usuario"
      name="user_id"
      component={AsyncSelect}
      source="/resources/users"
      className="col-span-2"
      obb
    />
    <Field
      labelKey="global.type"
      name="type"
      component={Select}
      items={TYPE_ITEMS}
      placeholder={t('global.type')}
      obb
    />
    <Field label="Placa" name="license_plate" obb />
  </div>
)
