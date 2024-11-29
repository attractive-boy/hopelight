import { ReactNode } from 'react'
import { BottomTabBar } from './TabBar'

interface LayoutProps {
  children: ReactNode
  showTabBar?: boolean
}

export function Layout({ children, showTabBar = false }: LayoutProps) {
  return (
    <div style={{ paddingBottom: showTabBar ? '50px' : 0 }}>
      {children}
      {showTabBar && <BottomTabBar />}
    </div>
  )
}