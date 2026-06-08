import Image from 'next/image'

export function CondorIcon({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <div className={`relative flex-shrink-0 ${className}`}>
      <Image
        src="/kandor-logo.PNG"
        alt="Kandor Logo"
        fill
        className="object-contain"
        sizes="(max-width: 768px) 32px, 48px"
        priority
      />
    </div>
  )
}
