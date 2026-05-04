import { getEditais } from '@/lib/supabase';
import { MainLayout } from '@/components/main-layout';

export default async function Home() {
  const editais = await getEditais();
  
  return <MainLayout editais={editais} />;
}
