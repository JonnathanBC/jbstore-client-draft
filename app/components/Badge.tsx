type Props = {
  label: string
}

export const Badge = ({ label }: Props) => {
  return (
    <span className="text-heading rounded-full bg-gray-100 px-2 py-1 text-xs">
      {label}
    </span>
  )
}
