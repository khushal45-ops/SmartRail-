import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Separator } from "./ui/separator";
import { Shield, Users, Bell, Database, Lock, CheckCircle } from "lucide-react";

const roles = [
  { id: "superadmin", name: "Super Admin", desc: "Full system access", color: "bg-red-500/20 text-red-400 border-red-500/30", perms: ["All modules", "User management", "System settings", "Data export", "Emergency controls"] },
  { id: "admin", name: "Railway Admin", desc: "Station & train management", color: "bg-violet-500/20 text-violet-400 border-violet-500/30", perms: ["Train monitoring", "Platform management", "Staff management", "Alert system", "Analytics"] },
  { id: "controller", name: "Train Controller", desc: "Train operations", color: "bg-blue-500/20 text-blue-400 border-blue-500/30", perms: ["Train monitoring", "Alert system", "PNR lookup", "Passenger portal"] },
  { id: "staff", name: "Station Staff", desc: "Station-level access", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", perms: ["Train monitoring", "Alert viewing", "PNR lookup"] },
  { id: "passenger", name: "Passenger", desc: "Self-service portal", color: "bg-amber-500/20 text-amber-400 border-amber-500/30", perms: ["PNR status", "Train status", "AI Chatbot"] },
];

const users = [
  { id: 1, name: "Rajesh Kumar", email: "rajesh@indianrail.gov.in", role: "admin", station: "New Delhi", active: true },
  { id: 2, name: "Meena Patel", email: "meena@indianrail.gov.in", role: "controller", station: "Mumbai", active: true },
  { id: 3, name: "Suresh Nair", email: "suresh@indianrail.gov.in", role: "staff", station: "Chennai", active: false },
  { id: 4, name: "Kavita Singh", email: "kavita@indianrail.gov.in", role: "admin", station: "Howrah", active: true },
  { id: 5, name: "Guest User", email: "guest@example.com", role: "passenger", station: "—", active: true },
];

export function Settings() {
  const [notifSettings, setNotifSettings] = useState({
    emailAlerts: true, smsAlerts: false, pushNotif: true, delayAlerts: true, maintenanceWindow: false, weeklyReport: true,
  });
  const [currentRole, setCurrentRole] = useState("admin");

  const toggle = (key: keyof typeof notifSettings) => setNotifSettings((p) => ({ ...p, [key]: !p[key] }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-white">System Settings</h2>
        <p className="text-slate-400 text-sm">Configure roles, permissions, notifications, and system preferences</p>
      </div>

      <Tabs defaultValue="rbac">
        <TabsList className="bg-white/5 border border-white/10">
          <TabsTrigger value="rbac" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white text-slate-400">
            <Shield className="w-4 h-4 mr-1.5" /> Access Control
          </TabsTrigger>
          <TabsTrigger value="users" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white text-slate-400">
            <Users className="w-4 h-4 mr-1.5" /> Users
          </TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white text-slate-400">
            <Bell className="w-4 h-4 mr-1.5" /> Notifications
          </TabsTrigger>
          <TabsTrigger value="system" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white text-slate-400">
            <Database className="w-4 h-4 mr-1.5" /> System
          </TabsTrigger>
        </TabsList>

        {/* RBAC */}
        <TabsContent value="rbac" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="flex flex-col gap-3">
              <div className="text-slate-300 text-sm font-medium mb-1">Role Definitions</div>
              {roles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => setCurrentRole(role.id)}
                  className={`p-4 rounded-xl border text-left transition-all ${currentRole === role.id ? "border-blue-500 bg-blue-500/10" : "border-white/10 bg-white/5 hover:bg-white/10"}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white font-medium">{role.name}</span>
                    <Badge className={`text-xs ${role.color}`}>{role.id}</Badge>
                  </div>
                  <div className="text-slate-400 text-sm">{role.desc}</div>
                </button>
              ))}
            </div>

            <div className="lg:col-span-2">
              {roles.filter((r) => r.id === currentRole).map((role) => (
                <Card key={role.id} className="bg-slate-900/50 border-white/10">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <Shield className="w-5 h-5 text-blue-400" />
                      <div>
                        <CardTitle className="text-white">{role.name}</CardTitle>
                        <p className="text-slate-400 text-sm">{role.desc}</p>
                      </div>
                      <Badge className={`ml-auto ${role.color}`}>{role.id}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-slate-400 text-sm mb-3">Permitted Modules</div>
                    <div className="flex flex-col gap-2 mb-6">
                      {["Dashboard", "Train Monitoring", "Alert System", "Passenger Portal", "Admin Portal", "Analytics", "Platform Utilization", "AI Chatbot", "System Settings"].map((mod) => {
                        const allowed = role.perms.some(p => mod.toLowerCase().includes(p.toLowerCase().split(" ")[0]) || p === "All modules");
                        return (
                          <div key={mod} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                            <span className={`text-sm ${allowed ? "text-slate-300" : "text-slate-600"}`}>{mod}</span>
                            {allowed ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Lock className="w-4 h-4 text-slate-600" />}
                          </div>
                        );
                      })}
                    </div>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white w-full">Edit Role Permissions</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Users */}
        <TabsContent value="users" className="mt-4">
          <Card className="bg-slate-900/50 border-white/10">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-base">User Management</CardTitle>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white text-sm h-9">Add User</Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-slate-400 text-sm">User</th>
                    <th className="text-left py-3 px-4 text-slate-400 text-sm">Role</th>
                    <th className="text-left py-3 px-4 text-slate-400 text-sm">Station</th>
                    <th className="text-left py-3 px-4 text-slate-400 text-sm">Status</th>
                    <th className="text-left py-3 px-4 text-slate-400 text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => {
                    const role = roles.find(r => r.id === u.role);
                    return (
                      <tr key={u.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-sm font-medium">
                              {u.name.split(" ").map(n => n[0]).join("")}
                            </div>
                            <div>
                              <div className="text-white text-sm">{u.name}</div>
                              <div className="text-slate-500 text-xs">{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={`text-xs ${role?.color}`}>{role?.name}</Badge>
                        </td>
                        <td className="py-3 px-4 text-slate-400 text-sm">{u.station}</td>
                        <td className="py-3 px-4">
                          <Badge className={u.active ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs" : "bg-slate-500/20 text-slate-400 border-slate-500/30 text-xs"}>
                            {u.active ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="h-7 text-xs border-white/10 text-slate-300 hover:bg-white/10">Edit</Button>
                            <Button size="sm" variant="outline" className="h-7 text-xs border-red-500/30 text-red-400 hover:bg-red-500/10">Revoke</Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-slate-900/50 border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-base">Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-5">
                {[
                  { key: "emailAlerts" as const, label: "Email Alerts", desc: "Receive critical alerts via email" },
                  { key: "smsAlerts" as const, label: "SMS Alerts", desc: "Get SMS for urgent notifications" },
                  { key: "pushNotif" as const, label: "Push Notifications", desc: "Browser and mobile push notifications" },
                  { key: "delayAlerts" as const, label: "Delay Alerts", desc: "Alert when trains are delayed 15+ minutes" },
                  { key: "maintenanceWindow" as const, label: "Maintenance Alerts", desc: "Notifications during maintenance windows" },
                  { key: "weeklyReport" as const, label: "Weekly Report", desc: "Auto-send weekly performance summary" },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between">
                    <div>
                      <Label className="text-slate-300">{item.label}</Label>
                      <p className="text-slate-500 text-xs">{item.desc}</p>
                    </div>
                    <Switch checked={notifSettings[item.key]} onCheckedChange={() => toggle(item.key)} />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-base">Alert Routing</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div>
                  <Label className="text-slate-300 mb-2 block">Critical Alert Channel</Label>
                  <Select defaultValue="email-sms">
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-white/10 text-white">
                      <SelectItem value="email-sms">Email + SMS</SelectItem>
                      <SelectItem value="email">Email Only</SelectItem>
                      <SelectItem value="sms">SMS Only</SelectItem>
                      <SelectItem value="all">All Channels</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-slate-300 mb-2 block">Escalation Email</Label>
                  <Input defaultValue="ops-manager@indianrail.gov.in" className="bg-white/5 border-white/10 text-white" />
                </div>
                <div>
                  <Label className="text-slate-300 mb-2 block">Alert Quiet Hours</Label>
                  <div className="flex gap-3">
                    <Input defaultValue="23:00" className="bg-white/5 border-white/10 text-white" type="time" />
                    <span className="text-slate-400 self-center">to</span>
                    <Input defaultValue="06:00" className="bg-white/5 border-white/10 text-white" type="time" />
                  </div>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white mt-2">Save Settings</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* System */}
        <TabsContent value="system" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-slate-900/50 border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-base flex items-center gap-2"><Database className="w-4 h-4 text-blue-400" /> System Metrics</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 text-sm text-slate-400 text-center py-8">
                <p>System metrics and live analytics have been moved to the primary Analytics module.</p>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white mt-4 mx-auto w-fit">Go to Analytics</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
