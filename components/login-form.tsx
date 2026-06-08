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
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
      <form action={action} className="flex flex-col gap-6">
        <FieldGroup>
          <div className="flex flex-col items-center gap-1 text-center">
            <h1 className="text-2xl font-bold">Iniciar sesión</h1>
            <p className="text-sm text-balance text-muted-foreground">
              Bienvenido de nuevo 👋
            </p>
          </div>
          <Field>
            <FieldLabel htmlFor="email">Correo electrónico</FieldLabel>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="M22 7l-10 6L2 7" strokeLinecap="round"/>
              </svg>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="tu@correo.com"
                required
                className="bg-background pl-10"
              />
            </div>
          </Field>
          {state?.errors?.email && <p className="text-sm text-destructive">{state.errors.email}</p>}
          <Field>
            <FieldLabel htmlFor="password">Contraseña</FieldLabel>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" strokeLinecap="round"/>
              </svg>
              <Input
                id="password"
                name="password"
                type="password"
                required
                className="bg-background pl-10"
              />
            </div>
          </Field>
          {state?.errors?.password && <p className="text-sm text-destructive">{state.errors.password}</p>}
          <div className="flex justify-end">
            <Link href="#" className="text-sm text-blue-600 hover:underline">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          {state?.message && <p className="text-sm text-destructive">{state.message}</p>}
          <Field>
            <Button type="submit" disabled={pending} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              {pending ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </Button>
          </Field>
          <p className="text-sm text-center text-muted-foreground">
            ¿No tienes una cuenta?{' '}
            <Link href="/signup" className="text-blue-600 hover:underline">
              Regístrate
            </Link>
          </p>
        </FieldGroup>
      </form>
    </div>
  )
}
