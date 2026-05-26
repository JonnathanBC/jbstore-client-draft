import { useFormContext } from 'react-hook-form'

interface FieldErrorProps {
  name: string
}

export const FieldError = ({ name }: FieldErrorProps) => {
  const form = useFormContext()
  const error = form.formState.errors[name]

  if (!error?.message) return null

  return (
    <p className="mt-1 text-sm text-red-500">{error.message as string}</p>
  )
}
