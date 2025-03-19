
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

const SUPERVISOR_PASSWORD = "demo123"; // This should be moved to an environment variable

const Login = () => {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  // Legacy login mode for supervisors
  const handleSupervisorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (password === SUPERVISOR_PASSWORD) {
        // Use a shared supervisor account for authentication
        const { data, error } = await supabase.auth.signInWithPassword({
          email: "supervisor@example.com",
          password: SUPERVISOR_PASSWORD,
        });

        if (error) throw error;

        toast({
          title: "Welcome back!",
          description: "Successfully logged in as supervisor.",
        });

        navigate("/attendance");
      } else {
        toast({
          title: "Invalid password",
          description: "Please check your password and try again.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred during login.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // New user-specific login
  const handleUserLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: userPassword,
      });

      if (error) throw error;

      toast({
        title: "Welcome back!",
        description: "Successfully logged in.",
      });

      // We'll redirect to dashboard or last page they were on
      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid email or password.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            OptimaFlow Login
          </CardTitle>
          <CardDescription className="text-center">
            Sign in to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="user" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="user">User Login</TabsTrigger>
              <TabsTrigger value="supervisor">Supervisor Login</TabsTrigger>
            </TabsList>
            
            <TabsContent value="user">
              <form onSubmit={handleUserLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="userPassword">Password</Label>
                  </div>
                  <Input
                    id="userPassword"
                    type="password"
                    placeholder="Enter your password"
                    value={userPassword}
                    onChange={(e) => setUserPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Logging in..." : "Login"}
                </Button>
                <div className="text-center text-sm text-gray-500">
                  <span>Contact your administrator if you need access</span>
                </div>
              </form>
            </TabsContent>
            
            <TabsContent value="supervisor">
              <form onSubmit={handleSupervisorSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="supervisorPassword">Supervisor Password</Label>
                  <Input
                    id="supervisorPassword"
                    type="password"
                    placeholder="Enter supervisor password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Logging in..." : "Login"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
