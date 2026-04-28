import { Trash2Icon } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import * as React from 'react';

export default function AlertDialogDestructive({ id, name }: { id: string; name: string }) {
  const [loading, setLoading] = React.useState(false);
  async function handleDelete() {
    setLoading(true);
    try {
      const response = await fetch(`/api/user?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }
      setLoading(false);
      toast.success(`User ${name} deleted successfully!`);
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(`Failed to delete user ${name}. Please try again.`);
      setLoading(false);
    }
  }
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {loading ? (
          <Button variant='destructive' size='icon' disabled>
            <Spinner />
          </Button>
        ) : (
          <Button variant='destructive' size='icon'>
            <Trash2Icon />
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent size='sm'>
        <AlertDialogHeader>
          <AlertDialogMedia className='bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive'>
            <Trash2Icon />
          </AlertDialogMedia>
          <AlertDialogTitle>Delete user {name}?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete this user. View <a href='#'>Settings</a> .
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel variant='outline'>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              handleDelete().then(() => {
                window.location.reload();
              });
            }}
            variant='destructive'
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
