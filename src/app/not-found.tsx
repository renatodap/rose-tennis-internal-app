import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { FileQuestion } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-rose-silver/30">
        <CardContent className="p-6 text-center">
          <FileQuestion className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Page Not Found</h2>
          <p className="text-sm text-muted-foreground mb-4">
            The page you&apos;re looking for doesn&apos;t exist.
          </p>
          <Button asChild className="bg-rose-red hover:bg-rose-red/90">
            <Link href="/">Go Home</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
