import { columns, User } from './columns';
import { DataTable } from './data-table';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

async function getData(): Promise<User[]> {
  const response = await fetch('http://localhost:3000/api/user');
  const data = await response.json();

  return data.users;
}

export default async function DemoPage() {
  const data = await getData();

  return (
    <div className='container mx-auto py-10'>
      <div className='flex flex-row justify-around my-10 '>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>Users</h2>
          <p className='text-muted-foreground'>Manage your users here.</p>
        </div>
        <Link href='/users/create'>
          <Button className='ml-auto'>Create User</Button>
        </Link>
      </div>
      <DataTable columns={columns} data={data} />
    </div>
  );
}
