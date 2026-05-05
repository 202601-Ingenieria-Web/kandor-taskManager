import React from 'react';

import Link from 'next/link';
const buttonWompi = () => {
  const publicKey = process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY;
  const currency = 'COP';
  const urlRedirect = 'http://localhost:3000/checkout';
  const data = {
    id: '123456789',
    amountInCents: 10000,
    currency: currency,
  };

  const link = `https://checkout.wompi.co/p/?public-key=${publicKey}&currency=${data.currency}&amount-in-cents=${data.amountInCents}&reference=${data.id}`;
  return (
    <div>
      <Link href={link} target='_blank' rel='noopener noreferrer'>
        <button>Pagar con Wompi</button>
      </Link>
    </div>
  );
};

export default buttonWompi;
