import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Activity,
  BarChart3,
  CreditCard,
  DollarSign,
  Users,
} from "lucide-react";

interface ContentAreaProps {
  sidebarCollapsed?: boolean;
}

const ContentArea = ({ sidebarCollapsed = false }: ContentAreaProps) => {
  return (
    <div
      className={`flex-1 p-6 bg-background transition-all duration-300 ${sidebarCollapsed ? "ml-20" : "ml-0 md:ml-[280px]"}`}
    >
      <div className="flex flex-col gap-6">
        <header className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to your dashboard overview.
          </p>
        </header>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Revenue
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$45,231.89</div>
                  <p className="text-xs text-muted-foreground">
                    +20.1% from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Subscriptions
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">+2350</div>
                  <p className="text-xs text-muted-foreground">
                    +180.1% from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Sales</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">+12,234</div>
                  <p className="text-xs text-muted-foreground">
                    +19% from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Active Now
                  </CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">+573</div>
                  <p className="text-xs text-muted-foreground">
                    +201 since last hour
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Overview</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                  <div className="h-[200px] flex items-center justify-center bg-muted/20 rounded-md">
                    <BarChart3 className="h-16 w-16 text-muted-foreground/50" />
                    <span className="ml-2 text-muted-foreground">
                      Chart placeholder
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Recent Sales</CardTitle>
                  <CardDescription>
                    You made 265 sales this month.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex items-center">
                        <div className="mr-4 rounded-full overflow-hidden">
                          <img
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=user${i}`}
                            alt="Avatar"
                            className="h-9 w-9"
                          />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium leading-none">
                            User {i}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            user{i}@example.com
                          </p>
                        </div>
                        <div className="ml-auto font-medium">
                          ${(Math.random() * 1000).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent
            value="analytics"
            className="h-[400px] flex items-center justify-center bg-muted/20 rounded-md"
          >
            <div className="text-center">
              <BarChart3 className="h-16 w-16 mx-auto text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-medium">Analytics Content</h3>
              <p className="text-muted-foreground">
                Analytics data will be displayed here.
              </p>
            </div>
          </TabsContent>

          <TabsContent
            value="reports"
            className="h-[400px] flex items-center justify-center bg-muted/20 rounded-md"
          >
            <div className="text-center">
              <BarChart3 className="h-16 w-16 mx-auto text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-medium">Reports Content</h3>
              <p className="text-muted-foreground">
                Reports data will be displayed here.
              </p>
            </div>
          </TabsContent>

          <TabsContent
            value="notifications"
            className="h-[400px] flex items-center justify-center bg-muted/20 rounded-md"
          >
            <div className="text-center">
              <BarChart3 className="h-16 w-16 mx-auto text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-medium">
                Notifications Content
              </h3>
              <p className="text-muted-foreground">
                Notifications will be displayed here.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ContentArea;
