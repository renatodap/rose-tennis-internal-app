'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, Lock, Loader2, Eye, EyeOff } from 'lucide-react'
import { checkEmailWhitelist, createUserManually } from '@/lib/actions/auth'
import { cn } from '@/lib/utils'

type AuthMode = 'signin' | 'signup'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mode, setMode] = useState<AuthMode>('signin')
  const emailRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Auto-focus email field on mount and mode change
  useEffect(() => {
    emailRef.current?.focus()
  }, [mode])

  // Password validation: 8+ chars, at least 1 special character
  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 8) {
      return 'Password must be at least 8 characters'
    }
    if (!/[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/`~;']/.test(pwd)) {
      return 'Password must contain at least 1 special character'
    }
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Validate Rose-Hulman email
    if (!email.endsWith('@rose-hulman.edu')) {
      setError('Please use your Rose-Hulman email address')
      setLoading(false)
      return
    }

    const nextUrl = searchParams.get('next') || '/'

    if (mode === 'signup') {
      // Validate password
      const pwdError = validatePassword(password)
      if (pwdError) {
        setError(pwdError)
        setLoading(false)
        return
      }

      // Check whitelist
      const isWhitelisted = await checkEmailWhitelist(email)
      if (!isWhitelisted) {
        setError('Email not found in team roster. Contact your coach if you believe this is an error.')
        setLoading(false)
        return
      }

      // Create user using Admin API (bypasses the problematic trigger)
      const result = await createUserManually(email, password)

      if (!result.success) {
        setError(result.message)
        setLoading(false)
        return
      }

      // Sign in after successful account creation
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        setError('Account created! Please sign in.')
        setMode('signin')
      } else {
        router.push(nextUrl)
        router.refresh()
      }
    } else {
      // Sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        if (signInError.message.includes('Invalid login')) {
          setError('Invalid email or password')
        } else {
          setError(signInError.message)
        }
      } else {
        router.push(nextUrl)
        router.refresh()
      }
    }

    setLoading(false)
  }

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode)
    setError(null)
    setPassword('')
  }

  return (
    <Card className="w-full max-w-sm border-rose-silver/30">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-md bg-rose-red">
          <span className="text-2xl font-bold text-white">R</span>
        </div>
        <CardTitle className="text-xl">Rose-Hulman Tennis</CardTitle>
      </CardHeader>

      <CardContent className="pt-2">
        {/* Tab Navigation */}
        <div className="flex border-b border-rose-silver/30 mb-6">
          <button
            type="button"
            onClick={() => switchMode('signin')}
            className={cn(
              'flex-1 py-3 text-sm font-medium text-center transition-colors relative',
              mode === 'signin'
                ? 'text-rose-red'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Sign in
            {mode === 'signin' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-red" />
            )}
          </button>
          <button
            type="button"
            onClick={() => switchMode('signup')}
            className={cn(
              'flex-1 py-3 text-sm font-medium text-center transition-colors relative',
              mode === 'signup'
                ? 'text-rose-red'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Create account
            {mode === 'signup' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-red" />
            )}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                ref={emailRef}
                id="email"
                type="email"
                inputMode="email"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                placeholder="username@rose-hulman.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-9"
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder={mode === 'signup' ? '8+ chars, 1 special char' : 'Enter your password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-9 pr-10"
                required
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-2"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {mode === 'signup' && (
              <p className="text-xs text-muted-foreground">
                Must be 8+ characters with at least 1 special character
              </p>
            )}
          </div>

          {mode === 'signin' && (
            <div className="text-right">
              <Link
                href="/reset-password"
                className="text-xs text-muted-foreground hover:text-rose-red"
              >
                Forgot password?
              </Link>
            </div>
          )}

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <Button type="submit" className="w-full bg-rose-red hover:bg-rose-red/90" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {mode === 'signin' ? 'Signing in...' : 'Creating account...'}
              </>
            ) : (
              mode === 'signin' ? 'Sign in' : 'Create account'
            )}
          </Button>
        </form>

        {mode === 'signup' && (
          <p className="mt-4 text-xs text-center text-muted-foreground">
            Only players and staff on the team roster can create accounts.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
