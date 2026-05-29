import { cn } from "@/lib/utils"

export function TeamAvatar({
  name,
  logoUrl,
  size = 40,
  className,
}: {
  name: string
  logoUrl?: string | null
  size?: number
  className?: string
}) {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("")

  if (logoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logoUrl || "/placeholder.svg"}
        alt={`Logo ${name}`}
        width={size}
        height={size}
        className={cn("shrink-0 rounded-md object-cover ring-1 ring-border", className)}
        style={{ width: size, height: size }}
      />
    )
  }

  return (
    <div
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center rounded-md bg-secondary text-xs font-bold text-primary ring-1 ring-border",
        className,
      )}
      style={{ width: size, height: size }}
    >
      {initials || "?"}
    </div>
  )
}
