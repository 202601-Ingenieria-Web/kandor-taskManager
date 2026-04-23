'use client';

import * as React from 'react';
import { useForm } from '@tanstack/react-form';
import { toast } from 'sonner';
import * as z from 'zod';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { InputGroup } from '@/components/ui/input-group';
import { Spinner } from '@/components/ui/spinner';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectLabel,
} from '@/components/ui/select';
import { useParams } from 'next/navigation';

const formSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 5 characters.')
    .max(32, 'Name must be at most 32 characters.'),
  email: z.string().email('Please enter a valid email address.'),
  image: z.string().url('Please enter a valid URL.'),
  role: z.enum(['ADMIN', 'USER'], {
    message: 'Role must be either ADMIN or USER.',
  }),
  enabled: z.boolean(),
});

export function BugReportForm() {
  const params = useParams<{ id: string }>();
  console.log('params :>> ', params);
  const form = useForm({
    defaultValues: {
      name: '',
      email: '',
      image: '',
      role: 'USER',
      enabled: false,
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      console.log('Form submitted with values:', value);
      setLoading(true);
      try {
        const response = await fetch('/api/user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ user: value }),
        }).then((res) => {
          toast.success('User created successfully!');
          setLoading(false);
          return res;
        });

        if (!response.ok) {
          throw new Error('Failed to create user');
          setLoading(false);
        }
      } catch (error) {
        console.error('Error submitting form:', error);
        toast.error('Failed to create user. Please try again.');
        setLoading(false);
      }
    },
  });
  const [loading, setLoading] = React.useState(false);
  return (
    <div>
      <h2 className='text-2xl font-bold tracking-tight'>Users</h2>
      <p className='text-muted-foreground'>Manage your users here.</p>
      <div className='my-10 rounded-md border bg-popover p-6 max-w-2xl '>
        <div>
          <form
            id='bug-report-form'
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
          >
            <FieldGroup>
              <form.Field
                name='name'
                children={(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Nombre del usuario</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        placeholder='John Doe'
                        autoComplete='off'
                      />
                      {isInvalid && <FieldError errors={field.state.meta.errors} />}
                    </Field>
                  );
                }}
              />
              <form.Field
                name='email'
                children={(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>email</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        placeholder='John@example.com'
                        autoComplete='off'
                      />
                      {isInvalid && <FieldError errors={field.state.meta.errors} />}
                    </Field>
                  );
                }}
              />
              <form.Field
                name='image'
                children={(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>image URL</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        placeholder=' https://example.com/avatar.jpg'
                        autoComplete='off'
                      />
                      {isInvalid && <FieldError errors={field.state.meta.errors} />}
                    </Field>
                  );
                }}
              />
              <form.Field
                name='role'
                children={(field) => {
                  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Role</FieldLabel>
                      <InputGroup>
                        <Select defaultValue='USER'>
                          <SelectTrigger>
                            <SelectValue placeholder='ROLE' />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Role</SelectLabel>
                              <SelectItem value='ADMIN'>ADMIN</SelectItem>
                              <SelectItem value='USER'>USER</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </InputGroup>
                      <FieldDescription>
                        Select the role of the user. This will determine their permissions in the
                        system.
                      </FieldDescription>
                      {isInvalid && <FieldError errors={field.state.meta.errors} />}
                    </Field>
                  );
                }}
              />
            </FieldGroup>
          </form>
        </div>
        <div>
          <Field orientation='horizontal'>
            <Button type='button' variant='outline' onClick={() => form.reset()}>
              Reset
            </Button>
            {!loading ? (
              <Button type='submit' form='bug-report-form'>
                Submit
              </Button>
            ) : (
              <Button type='button' form='bug-report-form'>
                <Spinner data-icon='inline-start' />
                Loading...
              </Button>
            )}
          </Field>
        </div>
      </div>
    </div>
  );
}

export default function CreateUserPage() {
  return (
    <div className='container mx-auto py-10'>
      <BugReportForm />
      <Link href='/users'>
        <Button type='button'>Cancelar</Button>
      </Link>
    </div>
  );
}
