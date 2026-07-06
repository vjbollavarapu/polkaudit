'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowRight, Lock } from 'lucide-react'
import { toast } from 'sonner'
import { setApiKeyOverride } from '@/lib/api'

export default function LoginPage() {
  const router = useRouter()
  const [apiKey, setApiKey] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!apiKey.trim()) {
      toast.error('Please enter an API key')
      return
    }

    setIsLoading(true)

    try {
      // Store API key for client-side requests (Settings can change later).
      setApiKeyOverride(apiKey.trim(), true)

      toast.success('Authentication successful')
      // Navigate to dashboard
      setTimeout(() => {
        router.push('/')
      }, 500)
    } catch (error) {
      toast.error('Authentication failed')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel - Brand */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-background to-muted/50 flex-col justify-between p-8 relative overflow-hidden">
        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 opacity-5">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.5"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Content */}
        <div className="relative z-10">
          <div className="space-y-2 mb-8">
            <h1 className="text-3xl font-bold text-foreground">PolkAudit</h1>
            <p className="text-sm text-muted-foreground">
              Governance transparency for Polkadot
            </p>
          </div>
        </div>

        {/* Footer Brand Info */}
        <div className="relative z-10 space-y-4">
          <div className="border-t border-border/50 pt-4">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Enterprise-grade audit platform for on-chain governance.
              Transparent, verifiable, and accessible.
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <Card className="w-full max-w-sm bg-card border-border p-8 space-y-6">
          {/* Header - Mobile Logo */}
          <div className="lg:hidden space-y-1 text-center mb-6">
            <h1 className="text-2xl font-bold text-foreground">PolkAudit</h1>
            <p className="text-xs text-muted-foreground">
              Governance transparency for Polkadot
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* API Key Input */}
            <div className="space-y-2">
              <label htmlFor="api-key" className="text-xs font-medium text-muted-foreground uppercase">
                API Key
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="api-key"
                  type="password"
                  placeholder="Enter your API key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="pl-9 bg-muted/50 border-border text-foreground placeholder:text-muted-foreground/50"
                  disabled={isLoading}
                  autoComplete="off"
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full gap-2"
              size="lg"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Authenticating...
                </>
              ) : (
                <>
                  Continue to dashboard
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          {/* Footer Note */}
          <div className="border-t border-border/50 pt-4">
            <p className="text-xs text-muted-foreground leading-relaxed text-center">
              MVP uses API key authentication. Wallet login planned for future releases.
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
