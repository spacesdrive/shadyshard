export function PageLoader() {
  return (
    <div className="flex min-h-svh items-center justify-center">
      <div
        className="border-border border-t-primary size-6 animate-spin rounded-full border-2"
        role="status"
        aria-label="Loading"
      />
    </div>
  )
}
