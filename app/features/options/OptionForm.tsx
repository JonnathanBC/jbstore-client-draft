import { useEffect } from 'react'
import { useFetcher } from 'react-router'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  Controller,
  SubmitHandler,
  useFieldArray,
  useForm,
} from 'react-hook-form'
import { Modal } from '~/components/modals/Modal'
import { Select } from '~/components/inputs/Select'
import { Input } from '~/components/inputs/Input'
import { useModalContext } from '~/components/modals/ModalContext'
import { t } from '~/i18n'

type Inputs = {
  name: string
  type: number
  features: Record<string, string>[]
}

export default function OptionForm() {
  const fetcher = useFetcher()
  const { onClose } = useModalContext()

  const { register, handleSubmit, control, watch } = useForm<Inputs>({
    values: {
      name: '',
      type: 1,
      features: [{ value: '', description: '' }],
    },
  })
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'features',
  })

  const type = watch('type')
  const features = watch('features')

  const onSubmit: SubmitHandler<Inputs> = (data) => {
    fetcher.submit(data, {
      method: 'POST',
      action: '/admin/options',
      encType: 'application/json',
    })
  }

  const isSubmitting = fetcher.state === 'submitting'

  useEffect(() => {
    if (fetcher.data?.error) {
      toast.error(fetcher.data.error)
    }
    if (fetcher.data?.success) {
      toast.success('Creado con éxito')
      onClose()
    }
  }, [fetcher.data])

  return (
    <Modal
      title="Nueva opción"
      actionButtons={
        <button
          className="btn btn-primary"
          type="button"
          disabled={isSubmitting}
          onClick={handleSubmit(onSubmit)}
        >
          {isSubmitting ? 'Guardando...' : 'Guardar'}
        </button>
      }
    >
      <form className="grid grid-cols-2 gap-4">
        <Input
          labelKey="global.name"
          placeholder="Nombre"
          {...register('name')}
        />

        <Controller
          name="type"
          control={control}
          render={({ field }) => (
            <div>
              <label>{t('global.type')}</label>
              <Select
                items={[
                  { value: '1', label: 'Texto' },
                  { value: '2', label: 'Color' },
                ]}
                value={String(field.value)}
                onChange={(value) => field.onChange(Number(value))}
                className="mt-0.5"
              />
            </div>
          )}
        />

        <hr className="col-span-2" />

        <h2 className="col-span-2">Valores</h2>

        <ul className="space-y-4 md:col-span-2">
          {fields.map((item, index) => (
            <li key={item.id} className="flex items-center">
              {type === 1 && (
                <Input
                  labelKey="global.value"
                  {...register(`features.${index}.value`)}
                  className="w-full"
                />
              )}

              {type === 2 && (
                <div className="flex w-full flex-col">
                  <label htmlFor={`color-${index}`} className="mb-0.5">
                    Color
                  </label>
                  <div className="flex h-10 w-full items-center justify-between rounded-md border border-zinc-300 px-2">
                    <span className="shrink-0">
                      {features[index].value || 'Selecciona'}
                    </span>
                    <input
                      id={`color-${index}`}
                      type="color"
                      {...register(`features.${index}.value`)}
                      className="border-none! focus:ring-0"
                    />
                  </div>
                </div>
              )}

              <Input
                labelKey="global.description"
                {...register(`features.${index}.description`)}
                className="ml-2 w-full"
              />
              <button
                type="button"
                onClick={() => remove(index)}
                className="mt-4 ml-4"
              >
                <Trash2 className="size-5 cursor-pointer hover:text-red-800" />
              </button>
            </li>
          ))}
        </ul>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => append({ value: '', description: '' })}
        >
          Añadir
        </button>
      </form>
    </Modal>
  )
}
