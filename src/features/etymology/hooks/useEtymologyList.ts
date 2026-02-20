import { useState, useEffect } from 'react';
import { Etymology } from '../types';
import { etymologyService } from '../services/etymologyService';

export function useEtymologyList() {
  const [etymologies, setEtymologies] = useState<Etymology[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEtymologies = async () => {
      try {
        const data = await etymologyService.getAllEtymologies();
        setEtymologies(data.sort((a, b) => a.sort_order - b.sort_order));
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEtymologies();
  }, []);

  return { etymologies, isLoading };
}
