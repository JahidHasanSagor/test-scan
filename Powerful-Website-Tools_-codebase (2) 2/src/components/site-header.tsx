"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useSession, authClient } from "@/lib/auth-client"
import { toast } from "sonner"
import { useTheme } from "@/contexts/theme-context"
import { Menu, Search } from "lucide-react"
import { LayoutGrid } from "lucide-react"
import { User } from "lucide-react"
import { Settings } from "lucide-react"
import { LogOut } from "lucide-react"
import { KeyRound } from "lucide-react"
import { Moon, Sun } from "lucide-react"
import { ProfileSidebar, ProfileTrigger } from "@/components/profile-sidebar"
import { Input } from "@/components/ui/input"
import { buildSearchUrl } from "@/lib/search-service"

export interface SiteHeaderProps {
  className?: string
  showAuth?: boolean
  customAuthSlot?: React.ReactNode
}

const BRAND_NAME = "Powerful Website You Should Know" as const

export default function SiteHeader({
  className,
  showAuth = false,
  customAuthSlot,
}: SiteHeaderProps) {
  const router = useRouter()
  const { data: session, isPending, refetch } = useSession()
  const { theme, toggleTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  const [sidebarOpen, setSidebarOpen] = React.useState(false)
  const [searchOpen, setSearchOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [suggestions, setSuggestions] = React.useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = React.useState(false)
  const searchInputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const handleSignOut = async () => {
    const { error } = await authClient.signOut()
    if (error?.code) {
      toast.error(error.code)
    } else {
      localStorage.removeItem("bearer_token")
      refetch()
      router.push("/")
      toast.success("Signed out successfully")
    }
  }

  // Fetch search suggestions
  React.useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.trim().length < 2) {
        setSuggestions([])
        return
      }

      try {
        const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(searchQuery)}`)
        if (response.ok) {
          const data = await response.json()
          setSuggestions(data.suggestions || [])
        }
      } catch (error) {
        console.error("Failed to fetch suggestions:", error)
      }
    }

    const debounce = setTimeout(fetchSuggestions, 300)
    return () => clearTimeout(debounce)
  }, [searchQuery])

  // Handle search submission
  const handleSearch = (query: string) => {
    if (!query.trim()) return
    const url = buildSearchUrl({ query: query.trim() })
    router.push(url)
    setSearchOpen(false)
    setSearchQuery("")
    setShowSuggestions(false)
  }

  // Handle search icon click
  const handleSearchIconClick = () => {
    setSearchOpen(true)
    setTimeout(() => {
      searchInputRef.current?.focus()
    }, 100)
  }

  // Close search when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchOpen && !(event.target as Element).closest('.search-container')) {
        setSearchOpen(false)
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [searchOpen])

  const showUserMenu = mounted && session?.user && !isPending

  // Render nothing until mounted to ensure consistent hydration
  if (!mounted) {
    return (
      <header className="sticky top-0 z-[100] w-full border-b border-border bg-card/95 backdrop-blur-sm supports-[backdrop-filter]:bg-card/80">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 gap-4">
          <div className="flex items-center md:hidden">
            <Button variant="ghost" size="icon" className="hover:bg-secondary">
              <Menu className="h-5 w-5" aria-hidden="true" />
            </Button>
          </div>
          
          <Link href="/" className="flex items-center gap-2 rounded-md px-1 py-1" aria-label="Go to homepage">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-primary-foreground">
              <LayoutGrid className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="hidden min-w-0 truncate text-sm font-semibold sm:inline md:text-base">
              {BRAND_NAME}
            </span>
          </Link>
          
          <nav className="hidden items-center gap-6 md:flex mx-auto">
            <ul className="flex items-center gap-1">
              <li><Link href="/search" className="rounded-md px-3 py-2 text-sm hover:bg-secondary">Search</Link></li>
              <li><Link href="/categories" className="rounded-md px-3 py-2 text-sm hover:bg-secondary">Categories</Link></li>
              <li><Link href="/community" className="rounded-md px-3 py-2 text-sm hover:bg-secondary">Community</Link></li>
              <li><Link href="/blog" className="rounded-md px-3 py-2 text-sm hover:bg-secondary">Blog</Link></li>
            </ul>
          </nav>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="hover:bg-secondary">
              <Search className="h-5 w-5" aria-hidden="true" />
            </Button>
            <Button variant="ghost" size="icon" className="hover:bg-secondary">
              <Moon className="h-5 w-5" aria-hidden="true" />
            </Button>
            <Link href="/submit" className="hidden sm:inline-flex items-center gap-2 rounded-lg gradient-ai px-4 h-9 text-white shadow-md hover:opacity-90 transition-opacity" aria-label="Submit Tool">
              <span className="text-sm font-semibold">Submit Your Tool</span>
            </Link>
            {showAuth && (
              <div className="hidden md:flex items-center gap-2">
                <Link href="/login"><Button variant="ghost" className="hover:bg-secondary">Log in</Button></Link>
                <Link href="/register"><Button variant="secondary" className="hover:bg-muted">Sign up</Button></Link>
              </div>
            )}
          </div>
        </div>
      </header>
    )
  }

  return (
    <>
      <header className="sticky top-0 z-[100] w-full border-b border-border bg-card/95 backdrop-blur-sm supports-[backdrop-filter]:bg-card/80">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 gap-4">
          {/* Mobile: menu */}
          <div className="flex items-center md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Open menu"
                  className="hover:bg-secondary"
                >
                  <Menu className="h-5 w-5" aria-hidden="true" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[320px] bg-card p-0">
                <div className="border-b border-border p-4">
                  <SheetHeader>
                    <SheetTitle className="flex items-center gap-2 text-base">
                      <LayoutGrid className="h-5 w-5" aria-hidden="true" />
                      <span className="font-display font-semibold">
                        {BRAND_NAME}
                      </span>
                    </SheetTitle>
                  </SheetHeader>
                </div>

                <nav aria-label="Mobile" className="border-t border-border">
                  <ul className="flex flex-col p-2">
                    <li>
                      <SheetClose asChild>
                        <Link
                          href="/search"
                          className="block rounded-lg px-3 py-2 text-sm hover:bg-secondary"
                        >
                          Search
                        </Link>
                      </SheetClose>
                    </li>
                    <li>
                      <SheetClose asChild>
                        <Link
                          href="/categories"
                          className="block rounded-lg px-3 py-2 text-sm hover:bg-secondary"
                        >
                          Categories
                        </Link>
                      </SheetClose>
                    </li>
                    <li>
                      <SheetClose asChild>
                        <Link
                          href="/community"
                          className="block rounded-lg px-3 py-2 text-sm hover:bg-secondary"
                        >
                          Community
                        </Link>
                      </SheetClose>
                    </li>
                    <li>
                      <SheetClose asChild>
                        <Link
                          href="/blog"
                          className="block rounded-lg px-3 py-2 text-sm hover:bg-secondary"
                        >
                          Blog
                        </Link>
                      </SheetClose>
                    </li>
                    <li className="mt-1 border-t border-border pt-2">
                      <SheetClose asChild>
                        <Link
                          href="/submit"
                          className="block rounded-lg px-3 py-2 text-sm font-medium gradient-text"
                        >
                          Submit Your Tool
                        </Link>
                      </SheetClose>
                    </li>
                  </ul>
                </nav>

                {showAuth && (
                  <div className="border-t border-border p-4">
                    {showUserMenu ? (
                      <div className="space-y-2">
                        <div className="mb-2 px-2 py-1 text-sm font-medium">
                          {session.user.name || session.user.email}
                        </div>
                        <SheetClose asChild>
                          <Link href="/dashboard" className="block">
                            <Button variant="ghost" className="w-full justify-start">
                              <User className="mr-2 h-4 w-4" />
                              Dashboard
                            </Button>
                          </Link>
                        </SheetClose>
                        <SheetClose asChild>
                          <Link href="/account/settings" className="block">
                            <Button variant="ghost" className="w-full justify-start">
                              <Settings className="mr-2 h-4 w-4" />
                              Account Settings
                            </Button>
                          </Link>
                        </SheetClose>
                        {session.user.role === "admin" && (
                          <SheetClose asChild>
                            <Link href="/admin" className="block">
                              <Button variant="ghost" className="w-full justify-start">
                                <KeyRound className="mr-2 h-4 w-4" />
                                Admin Panel
                              </Button>
                            </Link>
                          </SheetClose>
                        )}
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={handleSignOut}
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          Log out
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <SheetClose asChild>
                          <Link href="/login" className="w-full">
                            <Button variant="ghost" className="w-full">
                              Log in
                            </Button>
                          </Link>
                        </SheetClose>
                        <SheetClose asChild>
                          <Link href="/register" className="w-full">
                            <Button className="w-full">Sign up</Button>
                          </Link>
                        </SheetClose>
                      </div>
                    )}
                  </div>
                )}
              </SheetContent>
            </Sheet>
          </div>

          {/* Brand */}
          <Link
            href="/"
            className="flex items-center gap-2 rounded-md px-1 py-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Go to homepage"
          >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-foreground text-primary-foreground">
              <LayoutGrid className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="hidden min-w-0 truncate text-sm font-semibold sm:inline md:text-base">
              {BRAND_NAME}
            </span>
          </Link>

          {/* Desktop nav - centered */}
          <nav className="hidden items-center gap-6 md:flex mx-auto">
            <ul className="flex items-center gap-1">
              <li>
                <Link
                  href="/categories"
                  className="rounded-md px-3 py-2 text-sm hover:bg-secondary"
                >
                  Categories
                </Link>
              </li>
              <li>
                <Link
                  href="/community"
                  className="rounded-md px-3 py-2 text-sm hover:bg-secondary"
                >
                  Community
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="rounded-md px-3 py-2 text-sm hover:bg-secondary"
                >
                  Blog
                </Link>
              </li>
            </ul>
          </nav>

          {/* Right section */}
          <div className="flex items-center gap-2">
            {/* Global Search */}
            <div className="search-container relative">
              {!searchOpen ? (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSearchIconClick}
                  aria-label="Search"
                  className="hover:bg-secondary"
                >
                  <Search className="h-5 w-5" aria-hidden="true" />
                </Button>
              ) : (
                <div className="relative">
                  <div className="flex items-center gap-1 rounded-lg border border-border bg-background px-3 py-1.5 shadow-lg min-w-[240px] sm:min-w-[280px]">
                    <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                    <Input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Search tools..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value)
                        setShowSuggestions(true)
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSearch(searchQuery)
                        } else if (e.key === 'Escape') {
                          setSearchOpen(false)
                          setShowSuggestions(false)
                        }
                      }}
                      onFocus={() => setShowSuggestions(true)}
                      className="border-0 bg-transparent shadow-none focus-visible:ring-0 h-7 px-0 text-sm"
                    />
                  </div>
                  
                  {/* Suggestions Dropdown */}
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute top-full mt-2 w-full rounded-lg border border-border bg-card shadow-lg overflow-hidden z-50">
                      {suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSearch(suggestion)}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-accent transition-colors flex items-center gap-2"
                        >
                          <Search className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>{suggestion}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="hover:bg-secondary"
              suppressHydrationWarning
            >
              {mounted && theme === "dark" ? (
                <Sun className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Moon className="h-5 w-5" aria-hidden="true" />
              )}
            </Button>

            {/* Submit button with AI gradient */}
            <Link 
              href="/submit" 
              className="hidden sm:inline-flex items-center gap-2 rounded-lg gradient-ai px-4 h-9 text-white shadow-md hover:opacity-90 transition-opacity" 
              aria-label="Submit Tool"
            >
              <span className="text-sm font-semibold">Submit Your Tool</span>
            </Link>

            {/* Auth section */}
            {customAuthSlot ? (
              <div suppressHydrationWarning>{customAuthSlot}</div>
            ) : showAuth ? (
              <div className="hidden md:flex items-center gap-2" suppressHydrationWarning>
                {showUserMenu ? (
                  <ProfileTrigger onClick={() => setSidebarOpen(true)} />
                ) : (
                  <>
                    <Link href="/login">
                      <Button variant="ghost" className="hover:bg-secondary">
                        Log in
                      </Button>
                    </Link>
                    <Link href="/register">
                      <Button variant="secondary" className="hover:bg-muted">
                        Sign up
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </header>

      <ProfileSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
    </>
  )
}