import * as React from "react"
import { cn } from "@/lib/utils"

export interface TileProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  icon?: React.ReactNode
  description?: string
}

const Tile = React.forwardRef<HTMLDivElement, TileProps>(
  ({ className, title, icon, description, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col items-center justify-center p-4 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-lg shadow-lg cursor-pointer hover:shadow-xl transition-all duration-300 ease-in-out",
          className
        )}
        {...props}
      >
        {icon && <div className="mb-2 text-4xl">{icon}</div>}
        <h3 className="text-xl font-bold mb-1">{title}</h3>
        {description && <p className="text-sm text-center opacity-80">{description}</p>}
      </div>
    )
  }
)
Tile.displayName = "Tile"

export { Tile }
