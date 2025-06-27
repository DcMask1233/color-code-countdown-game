
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Play, Zap, Trash2 } from 'lucide-react';

export const AutomatedGameSystem: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [lastRun, setLastRun] = useState<string | null>(null);
  const [systemStatus, setSystemStatus] = useState<'idle' | 'running' | 'error'>('idle');
  const { toast } = useToast();

  useEffect(() => {
    // Set up interval to run automated game engine every minute
    const interval = setInterval(() => {
      runAutomatedEngine();
    }, 60000); // Run every minute

    // Also run once immediately
    runAutomatedEngine();

    return () => clearInterval(interval);
  }, []);

  const runAutomatedEngine = async () => {
    if (isRunning) return;
    
    setIsRunning(true);
    setSystemStatus('running');
    
    try {
      const { data, error } = await supabase.functions.invoke('automated-game-engine');
      
      if (error) {
        console.error('❌ Automated engine error:', error);
        setSystemStatus('error');
        toast({
          title: "Error",
          description: "Failed to run automated engine",
          variant: "destructive"
        });
        return;
      }

      setLastRun(new Date().toISOString());
      setSystemStatus('idle');
      
      if (data?.results && data.results.length > 0) {
        toast({
          title: "Game Results Generated",
          description: `Generated ${data.results.length} new results`,
        });
      }
      
    } catch (error) {
      console.error('💥 Automated engine error:', error);
      setSystemStatus('error');
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsRunning(false);
    }
  };

  const clearOldData = async () => {
    setIsRunning(true);
    
    try {
      toast({
        title: "Clearing Old Data",
        description: "Removing old unformatted period data...",
      });

      const { data, error } = await supabase.functions.invoke('clear-old-data');
      
      if (error) {
        console.error('❌ Data cleanup error:', error);
        toast({
          title: "Error",
          description: "Failed to clear old data",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Success",
        description: `Cleared ${data?.deletedResults || 0} old results and ${data?.deletedBets || 0} old bets`,
      });
      
    } catch (error) {
      console.error('💥 Data cleanup error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsRunning(false);
    }
  };

  const fixPeriodSync = async () => {
    setIsRunning(true);
    
    try {
      toast({
        title: "Fixing Period Sync",
        description: "Settling all unsettled bets...",
      });

      const { data, error } = await supabase.functions.invoke('fix-period-sync');
      
      if (error) {
        console.error('❌ Period sync fix error:', error);
        toast({
          title: "Error",
          description: "Failed to fix period sync",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Success",
        description: `Fixed period sync: ${data?.settled_count || 0} bets settled`,
      });
      
    } catch (error) {
      console.error('💥 Period sync fix error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusBadge = () => {
    switch (systemStatus) {
      case 'running':
        return <Badge className="bg-blue-500">Running</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="secondary">Idle</Badge>;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Automated Game System
          {getStatusBadge()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">
              System automatically generates results and settles bets every minute
            </p>
            {lastRun && (
              <p className="text-xs text-gray-500 mt-1">
                Last run: {new Date(lastRun).toLocaleString()}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              onClick={runAutomatedEngine}
              disabled={isRunning}
              size="sm"
              className="flex items-center gap-2"
            >
              {isRunning ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              {isRunning ? 'Running...' : 'Run Now'}
            </Button>
            <Button
              onClick={clearOldData}
              disabled={isRunning}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Clear Old Data
            </Button>
            <Button
              onClick={fixPeriodSync}
              disabled={isRunning}
              variant="outline"
              size="sm"
            >
              Fix Sync
            </Button>
          </div>
        </div>
        
        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
          <strong>How it works:</strong>
          <ul className="mt-1 space-y-1">
            <li>• Checks all game types (Parity, Sapre, Bcone, Emerd) every minute</li>
            <li>• Generates results when countdown reaches 0 with new YYYY-MM-DD-XXX format</li>
            <li>• Automatically settles all bets and credits winnings</li>
            <li>• Updates "My Records" with win/lose status in real-time</li>
            <li>• "Clear Old Data" removes incompatible old period formats</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
