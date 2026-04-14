'use client';

import { LoginForm } from '@/components/login-form';
import Image from 'next/image';
import { HugeiconsIcon } from '@hugeicons/react';
import { LayoutBottomIcon } from '@hugeicons/core-free-icons';

export default function LoginPage() {
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
            <LoginForm />
          </div>
        </div>
      </div>
      <div className='relative hidden bg-muted lg:block'>
        <img
          src='/Login.png'
          alt='Image'
          className='absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale'
        />
      </div>
    </div>
  );
}
