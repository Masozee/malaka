import * as React from "react"
import { cn } from "@/lib/utils"

export interface TileProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  icon?: React.ReactNode
  description?: string
  /** Set to true when tile is used as a clickable/interactive element */
  interactive?: boolean
}

const Tile = React.forwardRef<HTMLDivElement, TileProps>(
  ({ className, title, icon, description, interactive = false, onClick, ...props }, ref) => {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (interactive && onClick && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault()
        onClick(e as unknown as React.MouseEvent<HTMLDivElement>)
      }
    }

    return (
      <div
        ref={ref}
        role={interactive ? "button" : undefined}
        tabIndex={interactive ? 0 : undefined}
        onKeyDown={interactive ? handleKeyDown : undefined}
        onClick={onClick}
        className={cn(
          "flex flex-col items-center justify-center p-4 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-lg cursor-pointer hover:shadow-lg transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          className
        )}
        {...props}
      >
        {icon && <div className="mb-2 text-4xl" aria-hidden="true">{icon}</div>}
        <h3 className="text-xl font-bold mb-1">{title}</h3>
        {description && <p className="text-sm text-center opacity-80">{description}</p>}
      </div>
    )
  }
)
Tile.displayName = "Tile"

export { Tile }
