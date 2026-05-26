import {
  useForm,
  FormProvider as RHFProvider,
  UseFormProps,
  FieldValues,
  SubmitHandler,
  UseFormReturn,
} from 'react-hook-form'

interface FormProviderProps<T extends FieldValues> {
  children: React.ReactNode | ((methods: UseFormReturn<T>) => React.ReactNode)
  onSubmit?: SubmitHandler<T>
  options?: UseFormProps<T>
  className?: string
}

export function FormProvider<T extends FieldValues>({
  children,
  options,
}: FormProviderProps<T>) {
  const methods = useForm<T>(options)

  return (
    <RHFProvider {...methods}>
      {typeof children === 'function' ? children(methods) : children}
    </RHFProvider>
  )
}
