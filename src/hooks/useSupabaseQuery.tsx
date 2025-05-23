
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export function useSupabaseQuery<T = any>(
  queryFn: () => Promise<{ data: T | null; error: Error | null }>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data, error } = await queryFn();
        
        if (error) {
          throw error;
        }
        
        setData(data);
      } catch (err: any) {
        setError(err);
        toast({
          title: "Error fetching data",
          description: err.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, dependencies);

  return { data, error, loading };
}
