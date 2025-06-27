
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { LogOut, RefreshCw, Database, Users, TrendingUp, Zap } from "lucide-react";
import { AutomatedGameSystem } from "@/components/game/AutomatedGameSystem";

const ADMIN_EMAIL = "dcmask21@gmail.com";

export default function AdminPanel() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBets: 0,
    totalResults: 0,
    pendingBets: 0
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAdminAccess();
    fetchStats();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data, error } = await supabase.auth.getUser();
      
      if (error || !data?.user) {
        navigate("/admin/login");
        return;
      }

      if (data.user.email !== ADMIN_EMAIL) {
        toast({
          title: "Access Denied",
          description: "Unauthorized access attempt",
          variant: "destructive"
        });
        navigate("/admin/login");
        return;
      }

      setUser(data.user);
    } catch (error) {
      console.error("Admin access check failed:", error);
      navigate("/admin/login");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Fetch various statistics
      const [usersRes, betsRes, resultsRes, pendingBetsRes] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('user_bets').select('*', { count: 'exact', head: true }),
        supabase.from('game_results').select('*', { count: 'exact', head: true }),
        supabase.from('user_bets').select('*', { count: 'exact', head: true }).eq('settled', false)
      ]);

      setStats({
        totalUsers: usersRes.count || 0,
        totalBets: betsRes.count || 0,
        totalResults: resultsRes.count || 0,
        pendingBets: pendingBetsRes.count || 0
      });
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged Out",
        description: "Successfully logged out of admin panel",
      });
      navigate("/admin/login");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to logout",
        variant: "destructive"
      });
    }
  };

  const handleSettleBets = async () => {
    try {
      toast({
        title: "Processing",
        description: "Settling pending bets...",
      });

      const { data, error } = await supabase.functions.invoke('settle-existing-bets');
      
      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: `Settlement complete: ${data?.settled_count || 0} bets processed`,
      });
      
      fetchStats(); // Refresh stats
    } catch (error) {
      console.error("Settlement failed:", error);
      toast({
        title: "Error",
        description: "Failed to settle bets",
        variant: "destructive"
      });
    }
  };

  const runGameEngine = async () => {
    try {
      toast({
        title: "Processing",
        description: "Running automated game engine...",
      });

      const { data, error } = await supabase.functions.invoke('automated-game-engine');
      
      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: `Game engine complete: ${data?.results?.length || 0} results generated`,
      });
      
      fetchStats(); // Refresh stats
    } catch (error) {
      console.error("Game engine failed:", error);
      toast({
        title: "Error",
        description: "Failed to run game engine",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="animate-spin h-8 w-8 mx-auto mb-2" />
          <p>Checking admin access...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
              <p className="text-gray-600">Welcome, {user.email}</p>
            </div>
            <Button 
              onClick={handleLogout}
              variant="outline"
              className="flex items-center gap-2"
            >
              <LogOut size={16} />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bets</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBets}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Game Results</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalResults}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Bets</CardTitle>
              <Badge variant={stats.pendingBets > 0 ? "destructive" : "secondary"}>
                {stats.pendingBets > 0 ? "Action Required" : "All Clear"}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingBets}</div>
            </CardContent>
          </Card>
        </div>

        {/* Automated Game System */}
        <div className="mb-8">
          <AutomatedGameSystem />
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Manual Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                Manual controls for game management and bet settlement.
              </p>
              <div className="space-y-2">
                <Button 
                  onClick={runGameEngine}
                  className="w-full flex items-center gap-2"
                >
                  <Zap size={16} />
                  Run Game Engine Now
                </Button>
                <Button 
                  onClick={handleSettleBets}
                  className="w-full"
                  variant="outline"
                  disabled={stats.pendingBets === 0}
                >
                  Settle Pending Bets ({stats.pendingBets})
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Database Connection:</span>
                  <Badge variant="secondary">Active</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Game Engine:</span>
                  <Badge variant="secondary">Running</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Settlement Service:</span>
                  <Badge variant="secondary">Online</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Automated System:</span>
                  <Badge className="bg-green-500">Active</Badge>
                </div>
              </div>
              <Button 
                onClick={fetchStats}
                variant="outline"
                className="w-full"
              >
                <RefreshCw size={16} className="mr-2" />
                Refresh Stats
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
