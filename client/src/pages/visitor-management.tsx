import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Users, UserPlus, Phone, User, LogIn, LogOut, CheckCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

import { insertVisitorSchema, type InsertVisitor, type Visitor } from "@shared/schema";

export default function VisitorManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch visitors
  const { data: visitors = [], isLoading } = useQuery<Visitor[]>({
    queryKey: ["/api/visitors"],
  });

  // Form setup
  const form = useForm<InsertVisitor>({
    resolver: zodResolver(insertVisitorSchema),
    defaultValues: {
      name: "",
      mobile: "",
    },
  });

  // Create visitor mutation
  const createVisitorMutation = useMutation({
    mutationFn: async (data: InsertVisitor) => {
      const response = await apiRequest("POST", "/api/visitors", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/visitors"] });
      form.reset();
      toast({
        title: "Welcome!",
        description: "Visitor has been successfully signed in.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to sign in visitor",
        variant: "destructive",
      });
    },
  });

  // Logout visitor mutation
  const logoutVisitorMutation = useMutation({
    mutationFn: async (visitorId: number) => {
      const response = await apiRequest("PATCH", `/api/visitors/${visitorId}/logout`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/visitors"] });
      toast({
        title: "Signed Out",
        description: "Visitor has been successfully signed out.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to sign out visitor",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertVisitor) => {
    createVisitorMutation.mutate(data);
  };

  const handleLogout = (visitorId: number) => {
    logoutVisitorMutation.mutate(visitorId);
  };

  const activeVisitors = visitors.filter(visitor => !visitor.logoutTime);
  const currentDate = format(new Date(), "EEEE, MMMM d, yyyy");

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Visitor Management</h1>
                <p className="text-sm text-slate-600">Track and manage visitor entries</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center space-x-4">
              <div className="text-sm text-slate-600">
                {currentDate}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Registration Form */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <UserPlus className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-xl">New Visitor Registration</CardTitle>
                <CardDescription>Enter visitor details to sign in</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Full Name <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="name"
                      {...form.register("name")}
                      placeholder="Enter full name"
                      className="pl-10"
                    />
                  </div>
                  {form.formState.errors.name && (
                    <p className="text-red-500 text-sm flex items-center">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {form.formState.errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mobile">
                    Mobile Number <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="mobile"
                      {...form.register("mobile")}
                      placeholder="Enter 10-digit mobile number"
                      className="pl-10"
                    />
                  </div>
                  {form.formState.errors.mobile && (
                    <p className="text-red-500 text-sm flex items-center">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {form.formState.errors.mobile.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-center pt-4">
                <Button
                  type="submit"
                  disabled={createVisitorMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700 font-semibold py-3 px-8 min-w-[140px]"
                >
                  {createVisitorMutation.isPending ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Signing In...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <LogIn className="h-4 w-4" />
                      <span>Sign In</span>
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Visitor Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-slate-100 p-2 rounded-lg">
                  <Users className="h-5 w-5 text-slate-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">Visitor Log</CardTitle>
                  <CardDescription>Track all visitor entries and exits</CardDescription>
                </div>
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {activeVisitors.length} Active Visitors
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-12 text-center">
                <div className="w-8 h-8 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
                <p className="text-slate-600">Loading visitors...</p>
              </div>
            ) : visitors.length === 0 ? (
              <div className="p-12 text-center">
                <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 mb-2">No visitors yet</h3>
                <p className="text-slate-600">Visitor entries will appear here once someone signs in.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead className="font-semibold text-slate-600">S.No</TableHead>
                      <TableHead className="font-semibold text-slate-600">Name</TableHead>
                      <TableHead className="font-semibold text-slate-600">Mobile Number</TableHead>
                      <TableHead className="font-semibold text-slate-600">Login Time</TableHead>
                      <TableHead className="font-semibold text-slate-600">Logout Time</TableHead>
                      <TableHead className="font-semibold text-slate-600">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visitors.map((visitor, index) => (
                      <TableRow key={visitor.id} className="hover:bg-slate-50">
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              visitor.logoutTime ? 'bg-slate-100' : 'bg-blue-100'
                            }`}>
                              <User className={`h-4 w-4 ${
                                visitor.logoutTime ? 'text-slate-600' : 'text-blue-600'
                              }`} />
                            </div>
                            <span className={`font-medium ${
                              visitor.logoutTime ? 'text-slate-500' : 'text-slate-900'
                            }`}>
                              {visitor.name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className={visitor.logoutTime ? 'text-slate-500' : 'text-slate-600'}>
                          {visitor.mobile}
                        </TableCell>
                        <TableCell className={visitor.logoutTime ? 'text-slate-500' : 'text-slate-600'}>
                          {format(new Date(visitor.loginTime), "h:mm a")}
                        </TableCell>
                        <TableCell>
                          {visitor.logoutTime ? (
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              {format(new Date(visitor.logoutTime), "h:mm a")}
                            </Badge>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {visitor.logoutTime ? (
                            <span className="text-xs text-slate-400 italic">Signed Out</span>
                          ) : (
                            <Button
                              onClick={() => handleLogout(visitor.id)}
                              disabled={logoutVisitorMutation.isPending}
                              size="sm"
                              className="bg-amber-500 hover:bg-amber-600 text-white"
                            >
                              <LogOut className="h-3 w-3 mr-1" />
                              Sign Out
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <footer className="mt-12 text-center text-sm text-slate-500">
          <p>&copy; 2024 Visitor Management System. All rights reserved.</p>
        </footer>
      </main>
    </div>
  );
}
