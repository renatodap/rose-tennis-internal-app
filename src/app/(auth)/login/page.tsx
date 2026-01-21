'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, Lock, Loader2, Eye, EyeOff } from 'lucide-react'

type AuthMode = 'signin' | 'signup'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mode, setMode] = useState<AuthMode>('signin')
  const supabase = createClient()
  const router = useRouter()

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

  // Check if email is whitelisted (exists in players or staff)
  const checkEmailWhitelist = async (checkEmail: string): Promise<boolean> => {
    const { data: player } = await supabase
      .from('players')
      .select('id')
      .eq('email', checkEmail)
      .single()

    if (player) return true

    const { data: staffMember } = await supabase
      .from('staff')
      .select('id')
      .eq('email', checkEmail)
      .single()

    return !!staffMember
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

      // Sign up
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (signUpError) {
        if (signUpError.message.includes('already registered')) {
          setError('An account with this email already exists. Please sign in instead.')
        } else {
          setError(signUpError.message)
        }
        setLoading(false)
        return
      }

      // Auto sign in after signup (Supabase confirms email by default in dev)
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        // If sign in fails, account was created but needs email confirmation
        setError('Account created! Please check your email to confirm, then sign in.')
        setMode('signin')
      } else {
        router.push('/')
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
        router.push('/')
        router.refresh()
      }
    }

    setLoading(false)
  }

  return (
    <Card className="w-full max-w-sm border-rose-silver/30">
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-md bg-rose-red">
          <span className="text-2xl font-bold text-white">R</span>
        </div>
        <CardTitle className="text-xl">Rose-Hulman Tennis</CardTitle>
        <CardDescription>
          {mode === 'signin' ? 'Sign in to your account' : 'Create your account'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
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
                className="pl-9 pr-9"
                required
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {mode === 'signup' && (
              <p className="text-xs text-muted-foreground">
                Must be 8+ characters with at least 1 special character
              </p>
            )}
          </div>

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

        <div className="mt-4 text-center text-sm">
          {mode === 'signin' ? (
            <p className="text-muted-foreground">
              Don&apos;t have an account?{' '}
              <button
                type="button"
                onClick={() => { setMode('signup'); setError(null); }}
                className="text-rose-red hover:underline font-medium"
              >
                Sign up
              </button>
            </p>
          ) : (
            <p className="text-muted-foreground">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => { setMode('signin'); setError(null); }}
                className="text-rose-red hover:underline font-medium"
              >
                Sign in
              </button>
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
