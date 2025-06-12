
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const AutoResultGenerator = () => {
  useEffect(() => {
    const generateResults = async () => {
      try {
        console.log('Generating game results...');
        const { data, error } = await supabase.functions.invoke('generate-game-results');
        
        if (error) {
          console.error('Error generating results:', error);
        } else {
          console.log('Results generated successfully:', data);
        }
      } catch (error) {
        console.error('Error calling generate-game-results function:', error);
      }
    };

    // Generate results immediately
    generateResults();

    // Set up intervals for different durations
    const interval1min = setInterval(generateResults, 60 * 1000); // 1 minute
    const interval3min = setInterval(generateResults, 180 * 1000); // 3 minutes  
    const interval5min = setInterval(generateResults, 300 * 1000); // 5 minutes

    return () => {
      clearInterval(interval1min);
      clearInterval(interval3min);
      clearInterval(interval5min);
    };
  }, []);

  return null; // This component doesn't render anything
};
