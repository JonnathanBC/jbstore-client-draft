import { format } from 'date-fns'

export const renderDate = (date?: string | Date) => {
  try {
    if (date && date !== '') {
      date = format(new Date(date), 'dd-MM-yyyy')
    }
  } catch (e: any) {
    console.log('invalid', `[${date}]`, e.message)
  }
  return String(date) || '--'
}

export const renderDateTime = (date: string | Date) => {
  try {
    if (date && date !== '') date = format(new Date(date), 'dd/MM/yyyy HH:mm')
  } catch (e: any) {
    console.log('invalid', `[${date}]`, e.message)
  }
  return String(date) || '--'
}

export const renderTime = (date: string, withSeconds = false) => {
  try {
    if (date && date !== '')
      date = format(new Date(date), 'HH:mm' + (withSeconds ? ':ss' : ''))
  } catch (e: any) {
    console.log('invalid', `[${date}]`, e.message)
  }
  return date || '--'
}
