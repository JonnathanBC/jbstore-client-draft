import { AsyncSelect } from '~/components/inputs/AsyncSelect'
import { Field } from '~/components/inputs/Field'
import { DialogCrud } from '~/components/modals/DialogCrud'

export default function ProductVariantModal() {
  const onSubmit = (data: any) => {
    console.log({ data })
  }

  return (
    <DialogCrud title="Nueva opción" onSubmit={onSubmit}>
      <Field
        name="option_id"
        labelKey="global.option"
        component={AsyncSelect}
        source="/resources/options"
      />

      <Field name="test_id" labelKey="global.test" />
    </DialogCrud>
  )
}
