import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Bell,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Home,
  Menu,
  MessageSquare,
  PieChart,
  Settings,
  User,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const Sidebar = ({ collapsed, setCollapsed }: SidebarProps) => {
  return (
    <div
      className={`h-full bg-background border-r transition-all duration-300 ${collapsed ? "w-16" : "w-64"}`}
    >
      <div className="flex items-center justify-between p-4 border-b">
        {!collapsed && <h2 className="text-xl font-bold">Dashboard</h2>}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto"
        >
          {collapsed ? <ChevronRight /> : <ChevronLeft />}
        </Button>
      </div>

      <div className="p-2">
        <nav className="space-y-2">
          <Button
            variant="ghost"
            className={`w-full justify-${collapsed ? "center" : "start"}`}
          >
            <Home className="h-5 w-5 mr-2" />
            {!collapsed && <span>Home</span>}
          </Button>
          <Button
            variant="ghost"
            className={`w-full justify-${collapsed ? "center" : "start"}`}
          >
            <PieChart className="h-5 w-5 mr-2" />
            {!collapsed && <span>Analytics</span>}
          </Button>
          <Button
            variant="ghost"
            className={`w-full justify-${collapsed ? "center" : "start"}`}
          >
            <MessageSquare className="h-5 w-5 mr-2" />
            {!collapsed && <span>Messages</span>}
          </Button>
          <Button
            variant="ghost"
            className={`w-full justify-${collapsed ? "center" : "start"}`}
          >
            <Users className="h-5 w-5 mr-2" />
            {!collapsed && <span>Team</span>}
          </Button>
          <Button
            variant="ghost"
            className={`w-full justify-${collapsed ? "center" : "start"}`}
          >
            <Settings className="h-5 w-5 mr-2" />
            {!collapsed && <span>Settings</span>}
          </Button>
        </nav>
      </div>

      <div className="absolute bottom-0 w-full p-4 border-t">
        <div className="flex items-center">
          <Avatar>
            <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=user123" />
            <AvatarFallback>US</AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="ml-3">
              <p className="text-sm font-medium">User Name</p>
              <p className="text-xs text-muted-foreground">user@example.com</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface ContentAreaProps {
  sidebarCollapsed: boolean;
}

const ContentArea = ({ sidebarCollapsed }: ContentAreaProps) => {
  return (
    <div className="w-full h-full overflow-auto">
      <main className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Total Users</CardTitle>
              <CardDescription>User growth over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">1,234</div>
              <div className="text-sm text-muted-foreground mt-1">
                +12% from last month
              </div>
              <Progress value={75} className="mt-4" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Revenue</CardTitle>
              <CardDescription>Monthly revenue statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">$34,567</div>
              <div className="text-sm text-muted-foreground mt-1">
                +8% from last month
              </div>
              <Progress value={65} className="mt-4" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Active Projects</CardTitle>
              <CardDescription>Current project status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">12</div>
              <div className="text-sm text-muted-foreground mt-1">
                3 due this week
              </div>
              <Progress value={42} className="mt-4" />
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest user actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center">
                    <Avatar className="h-9 w-9">
                      <AvatarImage
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=user${i}`}
                      />
                      <AvatarFallback>U{i}</AvatarFallback>
                    </Avatar>
                    <div className="ml-4">
                      <p className="text-sm font-medium">
                        User {i} completed a task
                      </p>
                      <p className="text-xs text-muted-foreground">
                        2 hours ago
                      </p>
                    </div>
                    <Badge variant="outline" className="ml-auto">
                      Task
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Recent system notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start">
                    <div className="mr-4 mt-1 bg-primary/10 p-2 rounded-full">
                      <Bell className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        System Notification {i}
                      </p>
                      <p className="text-xs text-muted-foreground">1 day ago</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

const HomePage = () => {
  return (
    <div className="w-full h-full">
      <ContentArea sidebarCollapsed={false} />
    </div>
  );
};

export default HomePage;
