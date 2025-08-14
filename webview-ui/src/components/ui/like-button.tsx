import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const likeButtonVariants = cva(
	"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xs text-base font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer active:opacity-80",
	{
		variants: {
			variant: {
				default: "border border-vscode-input-border bg-primary text-primary-foreground hover:bg-primary/90",
				outline:
					"border border-vscode-input-border bg-transparent hover:bg-accent hover:text-accent-foreground",
				ghost: "hover:bg-accent hover:text-accent-foreground",
				like: "border-none bg-transparent hover:bg-transparent text-vscode-foreground",
				liked: "border-none bg-transparent hover:bg-transparent text-red-500",
			},
			size: {
				default: "h-7 px-3",
				sm: "h-6 px-2 text-sm",
				lg: "h-8 px-4 text-lg",
				icon: "h-7 w-7",
			},
		},
		defaultVariants: {
			variant: "like",
			size: "icon",
		},
	},
)

export interface LikeButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof likeButtonVariants> {
	liked?: boolean
	count?: number
}

const LikeButton = React.forwardRef<HTMLButtonElement, LikeButtonProps>(
	({ className, variant, size, liked = false, count, ...props }, ref) => {
		return (
			<button
				className={cn(likeButtonVariants({ variant: liked ? "liked" : "like", size, className }))}
				ref={ref}
				{...props}>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill={liked ? "currentColor" : "none"}
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					className="h-4 w-4">
					<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z" />
				</svg>
				{count !== undefined && <span>{count}</span>}
			</button>
		)
	},
)
LikeButton.displayName = "LikeButton"

export { LikeButton, likeButtonVariants }
