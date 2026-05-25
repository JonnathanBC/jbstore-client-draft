import { Loader } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { SubmitHandler, useForm, useWatch } from 'react-hook-form'
import { useFetcher } from 'react-router'
import { toast } from 'sonner'

import { Input } from '~/components/inputs/Input'
import { Button } from '~/components/ui/button'
import { Option } from '~/types/option'

type Inputs = {
  value: string | null
  description: string
  option_id: string
}

interface Props {
  option: Option
}

export const FeatureForm = ({ option }: Props) => {
  const { register, control, handleSubmit, reset, setValue } = useForm<Inputs>()
  const colorInputRef = useRef<HTMLInputElement>(null)
  const fetcher = useFetcher()
  const { type } = option
  const loading = fetcher.state === 'submitting'

  const value = useWatch({
    control,
    name: 'value',
  })

  const onSubmit: SubmitHandler<Inputs> = (data) => {
    const payload = {
      ...data,
      option_id: option.id,
    }

    fetcher.submit(
      { ...payload, intent: 'create-feature' },
      {
        method: 'POST',
        action: '/admin/options',
        encType: 'application/json',
      },
    )
  }

  useEffect(() => {
    if (fetcher.state !== 'idle' || !fetcher.data) return

    if (fetcher.data?.error) {
      toast.error(fetcher.data.error)
    } else if (fetcher.data?.success) {
      toast.success('Creado con éxito')
      reset()
    }
  }, [fetcher.data, fetcher.state])

  return (
    <form className="flex space-x-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="flex-1">
        {type === 1 && (
          <>
            <Input
              labelKey="global.value"
              {...register('value')}
              className="w-full"
            />
            {fetcher.data?.errors?.value?.[0] && (
              <p className="mt-1 text-sm text-red-500">
                {fetcher.data?.errors?.value[0]}
              </p>
            )}
          </>
        )}

        {type === 2 && (
          <div className="flex w-full flex-col">
            <label htmlFor={`color`} className="mb-0.5">
              Color
            </label>
            <div className="flex h-10 w-full items-center justify-between rounded-md border border-zinc-300 px-2">
              <span className="shrink-0">{value || 'Selecciona'}</span>
              <input
                ref={colorInputRef}
                id="color"
                type="color"
                value={value ?? '#000000'}
                onChange={(e) => setValue('value', e.target.value)}
                className="border-none! focus:ring-0"
              />
            </div>
            {fetcher.data?.errors?.value?.[0] && (
              <p className="mt-1 text-sm text-red-500">
                {fetcher.data?.errors?.value[0]}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="flex-1">
        <Input labelKey="global.description" {...register('description')} />
        {fetcher.data?.errors?.description?.[0] && (
          <p className="mt-1 text-sm text-red-500">
            {fetcher.data?.errors?.description[0]}
          </p>
        )}
      </div>

      <div>
        <Button className="mt-7" disabled={loading}>
          {loading && <Loader className="animate-spin" />}
          Agregar
        </Button>
      </div>
    </form>
  )
}
