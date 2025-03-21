
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Check } from "lucide-react";

const formSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  full_name: z.string().min(1, "Full name is required"),
  role: z.enum(["admin", "billing_admin", "qc_reviewer", "supervisor"]),
});

type FormData = z.infer<typeof formSchema>;

export const CreateUserForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      full_name: "",
      role: "qc_reviewer",
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setIsSuccess(false);
    
    try {
      const { data: userData, error } = await supabase.rpc("create_user", {
        email: data.email,
        password: data.password,
        full_name: data.full_name,
        role: data.role,
      });

      if (error) {
        throw error;
      }

      toast.success("User created successfully");
      setIsSuccess(true);
      form.reset();
    } catch (error: any) {
      console.error("Error creating user:", error);
      
      if (error.message.includes("duplicate key value")) {
        toast.error("A user with this email already exists");
      } else {
        toast.error(`Failed to create user: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New User</CardTitle>
        <CardDescription>
          Add a new user to the system and assign their role
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-600" />
              <p className="text-green-800 font-medium">
                User created successfully!
              </p>
            </div>
            <p className="text-green-700 text-sm mt-1 ml-7">
              You can now create another user or go back to the user list.
            </p>
          </div>
        )}
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="user@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="admin">Administrator</SelectItem>
                      <SelectItem value="billing_admin">Billing Admin</SelectItem>
                      <SelectItem value="qc_reviewer">QC Reviewer</SelectItem>
                      <SelectItem value="supervisor">Supervisor</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-sm text-blue-700">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium">Password requirements:</p>
                  <ul className="list-disc list-inside mt-1 ml-1 space-y-1">
                    <li>At least 8 characters</li>
                    <li>At least one uppercase letter</li>
                    <li>At least one lowercase letter</li>
                    <li>At least one number</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating User..." : "Create User"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
