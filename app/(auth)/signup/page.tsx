'use client'

import { useActionState } from 'react'
import { Button } from '@/components/ui/button'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { signup } from '@/app/actions/auth'
import Link from 'next/link'
import Image from 'next/image'

export default function SignupPage() {
  const [state, action, pending] = useActionState(signup, undefined)

  return (
    <div className='grid min-h-svh lg:grid-cols-2'>
      <div className='flex flex-col gap-4 p-6 md:p-10'>
        <div className='flex justify-center gap-2 md:justify-center'>
          <a href='#' className='flex items-center gap-2 font-medium'>
            <Image src='/LogoGreen.png' alt='Logo' width={200} height={200} className='h-60 w-60' />
          </a>
        </div>
        <div className='flex flex-1 items-center justify-center'>
          <div className='w-full max-w-xs'>
            <form action={action} className="flex flex-col gap-6">
              <FieldGroup>
                <div className="flex flex-col items-center gap-1 text-center">
                  <h1 className="text-2xl font-bold">Create an account</h1>
                  <p className="text-sm text-balance text-muted-foreground">
                    Enter your details to get started
                  </p>
                </div>
                <Field>
                  <FieldLabel htmlFor="name">Name</FieldLabel>
                  <Input id="name" name="name" type="text" placeholder="John Doe" required className="bg-background" />
                </Field>
                {state?.errors?.name && <p className="text-sm text-destructive">{state.errors.name}</p>}
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
                    {pending ? 'Creating account...' : 'Sign up'}
                  </Button>
                </Field>
                <p className="text-sm text-center text-muted-foreground">
                  Already have an account?{' '}
                  <Link href="/login" className="underline underline-offset-4">
                    Login
                  </Link>
                </p>
              </FieldGroup>
            </form>
          </div>
        </div>
      </div>
      <div className='relative hidden bg-muted lg:block'>
        <img src='/Login.png' alt='Image' className='absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale' />
      </div>
    </div>
  )
}
