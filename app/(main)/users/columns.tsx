'use client';

import { ColumnDef } from '@tanstack/react-table';

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type User = {
  id: string;
  name: string;
  email: string;
  image: string;
  deleted: boolean;
  enabled: boolean;
  role: 'ADMIN' | 'USER';
  createdAt: Date;
};

export const columns: ColumnDef<User>[] = [
  { accessorKey: 'image', header: 'Avatar' },
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'role',
    header: 'Role',
  },
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'enabled', header: 'Enabled' },
  {
    accessorKey: 'actions',
    header: 'Actions',
  },
];
