import '../styles/globals.css'
import Link from 'next/link'
import { AuthProvider } from './contexts/AuthContext'
import NavigationWrapper from './components/NavigationWrapper'
import ErrorBoundary from './components/ErrorBoundary'

export const metadata = {
  title: 'PlateMate - Discover, share, and rate recipes from home cooks around the world'
}

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ErrorBoundary>
          <AuthProvider>
            <NavigationWrapper />
            <main className="main-content">{children}</main>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
