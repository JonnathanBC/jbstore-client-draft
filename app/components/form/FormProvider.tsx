import { useEffect } from 'react'
import {
  useForm,
  FormProvider as RHFProvider,
  UseFormProps,
  FieldValues,
  UseFormReturn,
} from 'react-hook-form'

type ActionErrors = Record<string, string[]>

interface FormProviderProps<T extends FieldValues> {
  children: React.ReactNode | ((methods: UseFormReturn<T>) => React.ReactNode)
  options?: UseFormProps<T>
  actionData?: { errors?: ActionErrors } | null
  className?: string
}

export function FormProvider<T extends FieldValues>({
  children,
  options,
  actionData,
}: FormProviderProps<T>) {
  const methods = useForm<T>(options)

  useEffect(() => {
    if (!actionData?.errors) return
    methods.clearErrors()
    Object.entries(actionData.errors).forEach(([field, messages]) => {
      methods.setError(field as Parameters<typeof methods.setError>[0], {
        message: messages[0],
      })
    })
  }, [actionData])

  return (
    <RHFProvider {...methods}>
      {typeof children === 'function' ? children(methods) : children}
    </RHFProvider>
  )
}
