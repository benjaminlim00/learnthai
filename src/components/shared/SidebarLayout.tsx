"use client"

import { useState, useEffect, createContext, useContext } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/shared/theme-toggle"
import {
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Languages,
  RotateCcw,
  User,
} from "lucide-react"
import { cn } from "@/lib/utils"

// Sidebar context for managing state
const SidebarContext = createContext<{
  isCollapsed: boolean
  isMobileOpen: boolean
  setIsCollapsed: (collapsed: boolean) => void
  setIsMobileOpen: (open: boolean) => void
}>({
  isCollapsed: false,
  isMobileOpen: false,
  setIsCollapsed: () => {},
  setIsMobileOpen: () => {},
})

interface SidebarLayoutProps {
  children: React.ReactNode
}

interface NavItem {
  href: string
  label: string
  icon: React.ElementType
}

const navItems: NavItem[] = [
  { href: "/topic", label: "Generate", icon: BookOpen },
  { href: "/translate", label: "Translate", icon: Languages },
  { href: "/review", label: "Review", icon: RotateCcw },
  { href: "/account", label: "Account", icon: User },
]

export function SidebarLayout({ children }: SidebarLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const pathname = usePathname()

  // Close mobile sidebar when navigating
  useEffect(() => {
    setIsMobileOpen(false)
  }, [pathname])

  // Handle escape key to close mobile sidebar
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMobileOpen(false)
      }
    }

    if (isMobileOpen) {
      document.addEventListener("keydown", handleEscape)
      document.body.style.overflow = "hidden"
      return () => {
        document.removeEventListener("keydown", handleEscape)
        document.body.style.overflow = "unset"
      }
    }
  }, [isMobileOpen])

  return (
    <SidebarContext.Provider
      value={{
        isCollapsed,
        isMobileOpen,
        setIsCollapsed,
        setIsMobileOpen,
      }}
    >
      <div className="flex h-screen bg-background">
        {/* Mobile Overlay */}
        {isMobileOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsMobileOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 bg-card border-r border-border transition-all duration-300 ease-in-out lg:relative lg:translate-x-0 flex flex-col",
            // Mobile styles
            isMobileOpen ? "translate-x-0" : "-translate-x-full",
            // Desktop width
            isCollapsed ? "lg:w-16" : "lg:w-64",
            // Mobile width
            "w-64"
          )}
        >
          <SidebarContent />
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Mobile Header */}
          <header className="lg:hidden bg-card p-4 flex-shrink-0 relative flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileOpen(true)}
              //TODO: fix size
              className="h-9 w-9"
            >
              <Menu className="h-6 w-6" />
            </Button>

            <h1 className="absolute top-5 text-center text-lg font-semibold text-foreground left-1/2 transform -translate-x-1/2">
              LearnThaiAI
            </h1>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </div>
    </SidebarContext.Provider>
  )
}

function SidebarContent() {
  const { isCollapsed, isMobileOpen, setIsCollapsed, setIsMobileOpen } =
    useContext(SidebarContext)
  const pathname = usePathname()

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
        <div
          className={cn(
            "flex items-center gap-2",
            isCollapsed && "lg:justify-center"
          )}
        >
          {(!isCollapsed || isMobileOpen) && (
            <h1 className="text-xl font-semibold text-foreground">
              LearnThaiAI
            </h1>
          )}
        </div>

        {/* Mobile close button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsMobileOpen(false)}
          className="lg:hidden"
        >
          <X className="h-4 w-4" />
        </Button>

        {/* Desktop collapse button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted",
                    isCollapsed && "lg:justify-center lg:px-2"
                  )}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  {(!isCollapsed || isMobileOpen) && <span>{item.label}</span>}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Theme Toggle */}
      <div className="p-4 border-t border-border flex-shrink-0">
        <div
          className={cn(
            "flex items-center gap-3",
            isCollapsed && "lg:justify-center"
          )}
        >
          <ThemeToggle />
          {(!isCollapsed || isMobileOpen) && (
            <span className="text-sm text-muted-foreground">Toggle theme</span>
          )}
        </div>
      </div>
    </>
  )
}
