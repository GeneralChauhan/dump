'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ColdranLogo } from './logos/coldran'

interface NavigationItem {
  name: string
  href: string
  description: string
}

const navigation: NavigationItem[] = [
  { 
    name: 'Home', 
    href: '/',
    description: 'Welcome to my portfolio showcasing projects, meeting backgrounds, and technical writing.'
  },
  { 
    name: 'Meeting Backgrounds', 
    href: '/meeting-backgrounds',
    description: 'Professional virtual backgrounds for video calls. All images are automatically optimized and ready to download.'
  },
  { 
    name: 'Blog', 
    href: '/blog',
    description: 'Technical articles about development, programming languages, and software engineering best practices.'
  },
]

export function SidebarClient() {
  const pathname = usePathname()
  
  // Find the current page description
  const currentPage = navigation.find(item => 
    pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href))
  )
  const currentDescription = currentPage?.description || navigation[0].description
  
  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64 bg-neutral-50 border-r border-neutral-200 h-screen fixed left-0 top-0 p-4">
        <div className="flex flex-col h-full">
          <div className="flex-1">
            <div className="mb-6">
              <ColdranLogo />
              <h2 className="text-lg font-semibold text-neutral-900">
                Fun.Coldran.com
              </h2>
            </div>
            <nav className="space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href))
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`block px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? 'bg-neutral-200 text-neutral-900'
                        : 'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900'
                    }`}
                  >
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>
          
          {/* Page Description */}
          <div className="mt-auto pt-4 border-t border-neutral-200">
            <div className="px-3 py-2">
              <p className="text-xs text-neutral-600 leading-relaxed">
                {currentDescription}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      <div className="lg:hidden bg-neutral-50 border-b border-neutral-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-neutral-900">
            Fun.Coldran.com
          </h2>
        </div>
        <nav className="flex space-x-4 overflow-x-auto mb-3">
          {navigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href))
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`whitespace-nowrap px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? 'bg-neutral-200 text-neutral-900'
                    : 'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900'
                }`}
              >
                {item.name}
              </Link>
            )
          })}
        </nav>
        
        {/* Mobile Page Description */}
        <div className="pt-3 border-t border-neutral-200">
          <p className="text-xs text-neutral-600 leading-relaxed">
            {currentDescription}
          </p>
        </div>
      </div>
    </>
  )
}
