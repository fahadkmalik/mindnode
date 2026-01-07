import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Calendar, Clock, Home } from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"

export function MobileNav() {
    const location = useLocation();

    const routes = [
        { path: '/', label: 'Dashboard', icon: Home },
        { path: '/calendar', label: 'Calendar', icon: Calendar },
        { path: '/timeline', label: 'Timeline', icon: Clock },
    ];

    return (
        <div className="md:hidden">
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <Menu className="h-5 w-5" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[240px]">
                    <div className="flex flex-col gap-4 mt-8">
                        {routes.map(route => (
                            <Link
                                key={route.path}
                                to={route.path}
                                className={cn(
                                    "flex items-center gap-2 p-2 rounded-md hover:bg-muted transition-colors",
                                    location.pathname === route.path && "bg-muted font-medium"
                                )}
                            >
                                <route.icon className="h-4 w-4" />
                                {route.label}
                            </Link>
                        ))}
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    )
}
