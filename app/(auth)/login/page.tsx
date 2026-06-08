'use client';

import { LoginForm } from '@/components/login-form';

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-[1fr_1fr]">
      {/* Left side - Login Form */}
      <div className="flex items-center justify-center p-8 lg:p-12 bg-white">
        <div className="w-full max-w-md">
          <LoginForm />
        </div>
      </div>

      {/* Right side - Branding */}
      <div className="flex flex-col p-8 lg:p-12 bg-[#f8fafc]">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-12">
          <svg className="w-8 h-8 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round"/>
            <rect x="3" y="3" width="18" height="18" rx="2" />
          </svg>
          <span className="text-xl font-semibold text-gray-900">TaskFlow</span>
        </div>

        {/* Heading */}
        <div className="mb-8">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-4">
            Organiza tu trabajo.<br />
            Cumple tus <span className="text-blue-600">objetivos.</span>
          </h1>
          <p className="text-gray-500 text-lg max-w-md">
            TaskFlow es la forma más sencilla de planificar, organizar y gestionar tus tareas diarias.
          </p>
        </div>

        {/* Feature bullets */}
        <div className="space-y-4 mb-12">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-gray-700">Organiza tus tareas</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="text-gray-700">Establece prioridades</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 12v8M8 12v8M12 16v4" strokeLinecap="round"/>
                <rect x="4" y="8" width="16" height="4" rx="1"/>
              </svg>
            </div>
            <span className="text-gray-700">Haz seguimiento de tu progreso</span>
          </div>
        </div>

        {/* App Illustration */}
        <div className="flex-1 flex items-end justify-center relative">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg">
            <div className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-100">
              {/* Mock task interface */}
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
              </div>
              <div className="flex gap-4">
                {/* Sidebar mock */}
                <div className="w-16 space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-600"></div>
                  <div className="w-8 h-8 rounded-lg bg-gray-200"></div>
                  <div className="w-8 h-8 rounded-lg bg-gray-200"></div>
                </div>
                {/* Content mock */}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 mb-3">Mis tareas</h3>
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-gray-500 mb-1">Pendientes</div>
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                      <div className="w-4 h-4 border-2 border-gray-300 rounded"></div>
                      <div className="h-2 bg-gray-200 rounded flex-1"></div>
                      <div className="w-2 h-2 rounded-full bg-orange-400"></div>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                      <div className="w-4 h-4 border-2 border-gray-300 rounded"></div>
                      <div className="h-2 bg-gray-200 rounded flex-1"></div>
                      <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                    </div>
                    <div className="text-xs font-medium text-gray-500 mt-3 mb-1">En progreso</div>
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                      <div className="w-4 h-4 border-2 border-gray-300 rounded"></div>
                      <div className="h-2 bg-gray-200 rounded flex-1"></div>
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    </div>
                    <div className="text-xs font-medium text-gray-500 mt-3 mb-1">Completadas</div>
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                      <div className="w-4 h-4 bg-green-500 rounded flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <div className="h-2 bg-gray-200 rounded flex-1"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
