'use client'

import { useActionState } from 'react'
import { Button } from '@/components/ui/button'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { signup } from '@/app/actions/auth'
import Link from 'next/link'
import { CondorIcon } from '@/components/condor-icon'

export default function SignupPage() {
  const [state, action, pending] = useActionState(signup, undefined)

  return (
    <div className="grid min-h-svh lg:grid-cols-[1fr_1fr]">
      {/* Left side - Signup Form */}
      <div className="flex items-center justify-center p-8 lg:p-12 bg-white">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            <form action={action} className="flex flex-col gap-6">
              <FieldGroup>
                <div className="flex flex-col items-center gap-1 text-center">
                  <h1 className="text-2xl font-bold text-gray-900">Crear cuenta</h1>
                  <p className="text-sm text-balance text-gray-500">
                    Bienvenido a Kandor 👋
                  </p>
                </div>
                <Field>
                  <FieldLabel htmlFor="name" className="text-gray-700">Nombre</FieldLabel>
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" strokeLinecap="round"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                    <Input id="name" name="name" type="text" placeholder="Tu nombre" required className="bg-gray-50 border-gray-200 pl-10 focus:border-teal-500 focus:ring-teal-500" />
                  </div>
                </Field>
                {state?.errors?.name && <p className="text-sm text-red-600">{state.errors.name}</p>}
                <Field>
                  <FieldLabel htmlFor="email" className="text-gray-700">Correo electrónico</FieldLabel>
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <path d="M22 7l-10 6L2 7" strokeLinecap="round"/>
                    </svg>
                    <Input id="email" name="email" type="email" placeholder="tu@correo.com" required className="bg-gray-50 border-gray-200 pl-10 focus:border-teal-500 focus:ring-teal-500" />
                  </div>
                </Field>
                {state?.errors?.email && <p className="text-sm text-red-600">{state.errors.email}</p>}
                <Field>
                  <FieldLabel htmlFor="password" className="text-gray-700">Contraseña</FieldLabel>
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" />
                      <path d="M7 11V7a5 5 0 0110 0v4" strokeLinecap="round"/>
                    </svg>
                    <Input id="password" name="password" type="password" required className="bg-gray-50 border-gray-200 pl-10 focus:border-teal-500 focus:ring-teal-500" />
                  </div>
                </Field>
                {state?.errors?.password && <p className="text-sm text-red-600">{state.errors.password}</p>}
                {state?.message && <p className="text-sm text-red-600">{state.message}</p>}
                <Field>
                  <Button type="submit" disabled={pending} className="w-full bg-[#0f172a] hover:bg-slate-800 text-white">
                    {pending ? 'Creando cuenta...' : 'Crear cuenta'}
                  </Button>
                </Field>
                <p className="text-sm text-center text-gray-500">
                  ¿Ya tienes una cuenta?{' '}
                  <Link href="/login" className="text-teal-600 hover:text-teal-700 hover:underline">
                    Iniciar sesión
                  </Link>
                </p>
              </FieldGroup>
            </form>
          </div>
        </div>
      </div>

      {/* Right side - Branding */}
      <div className="flex flex-col p-8 lg:p-12 bg-[#0f172a]">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-12">
          <CondorIcon className="w-12 h-12" />
          <span className="text-xl font-semibold text-white">Kandor</span>
        </div>

        {/* Heading */}
        <div className="mb-8">
          <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
            Organiza tu trabajo.<br />
            Cumple tus <span className="text-teal-400">objetivos.</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-md">
            Kandor es la forma más sencilla de planificar, organizar y gestionar tus tareas diarias.
          </p>
        </div>

        {/* Feature bullets */}
        <div className="space-y-4 mb-12">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-teal-500/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-teal-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-gray-300">Organiza tus tareas</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-teal-500/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-teal-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="text-gray-300">Establece prioridades</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-teal-500/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-teal-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 12v8M8 12v8M12 16v4" strokeLinecap="round"/>
                <rect x="4" y="8" width="16" height="4" rx="1"/>
              </svg>
            </div>
            <span className="text-gray-300">Haz seguimiento de tu progreso</span>
          </div>
        </div>

        {/* App Illustration */}
        <div className="flex-1 flex items-end justify-center relative">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg">
            <div className="bg-[#1e293b] rounded-2xl shadow-2xl p-6 border border-slate-700">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
              </div>
              <div className="flex gap-4">
                <div className="w-16 space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-teal-500"></div>
                  <div className="w-8 h-8 rounded-lg bg-slate-600"></div>
                  <div className="w-8 h-8 rounded-lg bg-slate-600"></div>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white mb-3">Mis tareas</h3>
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-gray-400 mb-1">Pendientes</div>
                    <div className="flex items-center gap-2 p-2 bg-slate-700/50 rounded">
                      <div className="w-4 h-4 border-2 border-slate-500 rounded"></div>
                      <div className="h-2 bg-slate-600 rounded flex-1"></div>
                      <div className="w-2 h-2 rounded-full bg-orange-400"></div>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-slate-700/50 rounded">
                      <div className="w-4 h-4 border-2 border-slate-500 rounded"></div>
                      <div className="h-2 bg-slate-600 rounded flex-1"></div>
                      <div className="w-2 h-2 rounded-full bg-teal-400"></div>
                    </div>
                    <div className="text-xs font-medium text-gray-400 mt-3 mb-1">En progreso</div>
                    <div className="flex items-center gap-2 p-2 bg-slate-700/50 rounded">
                      <div className="w-4 h-4 border-2 border-slate-500 rounded"></div>
                      <div className="h-2 bg-slate-600 rounded flex-1"></div>
                      <div className="w-2 h-2 rounded-full bg-teal-500"></div>
                    </div>
                    <div className="text-xs font-medium text-gray-400 mt-3 mb-1">Completadas</div>
                    <div className="flex items-center gap-2 p-2 bg-slate-700/50 rounded">
                      <div className="w-4 h-4 bg-green-500 rounded flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <div className="h-2 bg-slate-600 rounded flex-1"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
