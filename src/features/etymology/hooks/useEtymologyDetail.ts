import { useState, useEffect } from 'react';
import { EtymologyWithWords } from '../types';
import { etymologyService } from '../services/etymologyService';

export function useEtymologyDetail(id: string) {
  const [data, setData] = useState<EtymologyWithWords | undefined>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const result = await etymologyService.getEtymologyWithWords(id);
        setData(result);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchDetail();
  }, [id]);

  return { data, isLoading };
}
