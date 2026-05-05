import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ButtonWompi from '@/components/buttonWompi';

export default function Home() {
  return (
    <div>
      <Card className='max-w-sm'>
        <CardHeader>
          <CardTitle>Project Overview</CardTitle>
          <CardDescription>
            Track progress and recent activity for your Yarn-based Next.js app.
          </CardDescription>
        </CardHeader>
        <CardContent>Your design system is ready. Start building your next component.</CardContent>
      </Card>
      <ButtonWompi />
    </div>
  );
}
