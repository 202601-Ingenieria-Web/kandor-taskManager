'use client'

import { useActionState } from 'react'
import { Button } from '@/components/ui/button'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { login } from '@/app/actions/auth'
import Link from 'next/link'

export function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined)

  return (
    <form action={action} className="flex flex-col gap-6">
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Login to your account</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Enter your email below to login
          </p>
        </div>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input id="email" name="email" type="email" placeholder="m@example.com" required className="bg-background" />
        </Field>
        {state?.errors?.email && <p className="text-sm text-destructive">{state.errors.email}</p>}
        <Field>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input id="password" name="password" type="password" required className="bg-background" />
        </Field>
        {state?.errors?.password && <p className="text-sm text-destructive">{state.errors.password}</p>}
        {state?.message && <p className="text-sm text-destructive">{state.message}</p>}
        <Field>
          <Button type="submit" disabled={pending} className="w-full">
            {pending ? 'Logging in...' : 'Login'}
          </Button>
        </Field>
        <p className="text-sm text-center text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="underline underline-offset-4">
            Sign up
          </Link>
        </p>
      </FieldGroup>
    </form>
  )
}
