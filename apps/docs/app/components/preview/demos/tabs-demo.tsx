'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@hareru/ui';

export default function TabsDemo() {
  return (
    <Tabs defaultValue="account" style={{ maxWidth: '24rem' }}>
      <TabsList>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>
      <TabsContent value="account">
        <p>Manage your account settings and preferences.</p>
      </TabsContent>
      <TabsContent value="password">
        <p>Change your password and security options.</p>
      </TabsContent>
      <TabsContent value="settings">
        <p>Configure application settings.</p>
      </TabsContent>
    </Tabs>
  );
}
