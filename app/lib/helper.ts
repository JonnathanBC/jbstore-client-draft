export function createImagePreview(file: File | null) {
  if (!file) return null

  return {
    url: URL.createObjectURL(file),
    revoke() {
      URL.revokeObjectURL(this.url)
    },
  }
}
