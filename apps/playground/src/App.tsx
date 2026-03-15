import {
  ApprovalCard,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  BentoGrid,
  BentoGridItem,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  ChatComposer,
  ChatComposerActions,
  ChatComposerInput,
  ChatComposerSend,
  ChatContainer,
  ChatContainerFooter,
  ChatContainerHeader,
  ChatContainerMessages,
  ChatMessage,
  ChatMessageContent,
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  ReasoningPanel,
  Separator,
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Skeleton,
  StreamingText,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  ThemeProvider,
  ToolCallCard,
  useTheme,
} from '@hareru/ui';
import { type FormEvent, useEffect, useState } from 'react';
import { TokensDemo } from './TokensDemo';

function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  return (
    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
      <span>
        Theme: {theme} ({resolvedTheme})
      </span>
      <Button variant="outline" size="sm" onClick={() => setTheme('light')}>
        Light
      </Button>
      <Button variant="outline" size="sm" onClick={() => setTheme('dark')}>
        Dark
      </Button>
      <Button variant="outline" size="sm" onClick={() => setTheme('system')}>
        System
      </Button>
    </div>
  );
}

function ButtonDemo() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Button</CardTitle>
        <CardDescription>All button variants and sizes</CardDescription>
      </CardHeader>
      <CardContent>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          <Button>Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
        </div>
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            marginTop: '1rem',
            alignItems: 'center',
          }}
        >
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
          <Button size="icon">★</Button>
          <Button disabled>Disabled</Button>
        </div>
      </CardContent>
    </Card>
  );
}

function InputDemo() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Input</CardTitle>
        <CardDescription>Input variants and states</CardDescription>
      </CardHeader>
      <CardContent>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            maxWidth: '24rem',
          }}
        >
          <Input placeholder="Default input" />
          <Input placeholder="Error state" error />
          <Input placeholder="Disabled" disabled />
          <Input type="file" />
        </div>
      </CardContent>
    </Card>
  );
}

function BadgeDemo() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Badge</CardTitle>
        <CardDescription>Badge variants</CardDescription>
      </CardHeader>
      <CardContent>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge variant="outline">Outline</Badge>
        </div>
      </CardContent>
    </Card>
  );
}

function SkeletonDemo() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Skeleton</CardTitle>
        <CardDescription>Loading placeholder</CardDescription>
      </CardHeader>
      <CardContent>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Skeleton style={{ width: '2.5rem', height: '2.5rem', borderRadius: '9999px' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
            <Skeleton style={{ width: '60%', height: '0.875rem' }} />
            <Skeleton style={{ width: '40%', height: '0.875rem' }} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SeparatorDemo() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Separator</CardTitle>
        <CardDescription>Horizontal and vertical separators</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Content above</p>
        <Separator style={{ margin: '0.75rem 0' }} />
        <p>Content below</p>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            height: '1.25rem',
            marginTop: '0.75rem',
          }}
        >
          <span>Left</span>
          <Separator orientation="vertical" />
          <span>Center</span>
          <Separator orientation="vertical" />
          <span>Right</span>
        </div>
      </CardContent>
    </Card>
  );
}

function AvatarDemo() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Avatar</CardTitle>
        <CardDescription>User avatar with fallback</CardDescription>
      </CardHeader>
      <CardContent>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Avatar>
            <AvatarImage src="https://api.dicebear.com/9.x/initials/svg?seed=HU" alt="Hareru UI" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarFallback>YT</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarFallback>AB</AvatarFallback>
          </Avatar>
        </div>
      </CardContent>
    </Card>
  );
}

function TabsDemo() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tabs</CardTitle>
        <CardDescription>Tabbed content with Base UI primitives</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="account">
          <TabsList>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="password">Password</TabsTrigger>
            <TabsTrigger value="settings" disabled>
              Settings
            </TabsTrigger>
          </TabsList>
          <TabsContent value="account">
            <p>Manage your account settings and preferences.</p>
          </TabsContent>
          <TabsContent value="password">
            <p>Change your password and security settings.</p>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function DialogDemo() {
  const [open, setOpen] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dialog</CardTitle>
        <CardDescription>Modal dialog with overlay</CardDescription>
      </CardHeader>
      <CardContent>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Open Dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Are you sure?</DialogTitle>
              <DialogDescription>
                This action cannot be undone. This will permanently delete your account.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button variant="destructive" onClick={() => setOpen(false)}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

function CardDemo() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Card</CardTitle>
        <CardDescription>A card with header, content, and footer</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Card content area. Cards use semantic HTML elements (article, header, footer).</p>
      </CardContent>
      <CardFooter>
        <Button variant="outline" size="sm">
          Cancel
        </Button>
        <Button size="sm" style={{ marginLeft: '0.5rem' }}>
          Save
        </Button>
      </CardFooter>
    </Card>
  );
}

function CommandDemo() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Command</CardTitle>
        <CardDescription>Command palette (Cmd+K pattern)</CardDescription>
      </CardHeader>
      <CardContent>
        <Button variant="outline" onClick={() => setOpen(true)}>
          Open Command Palette (Cmd+K)
        </Button>
        <CommandDialog open={open} onOpenChange={setOpen} title="Command Palette">
          <CommandInput placeholder="Type a command or search..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Suggestions">
              <CommandItem>Calendar</CommandItem>
              <CommandItem>Search</CommandItem>
              <CommandItem>Settings</CommandItem>
            </CommandGroup>
          </CommandList>
        </CommandDialog>
      </CardContent>
    </Card>
  );
}

function ComboboxDemo() {
  const [selected, setSelected] = useState('');

  const frameworks = [
    { value: 'react', label: 'React' },
    { value: 'vue', label: 'Vue' },
    { value: 'angular', label: 'Angular' },
    { value: 'svelte', label: 'Svelte' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Combobox</CardTitle>
        <CardDescription>Searchable select (framework picker)</CardDescription>
      </CardHeader>
      <CardContent>
        <Combobox>
          <ComboboxTrigger>{selected || 'Select framework...'}</ComboboxTrigger>
          <ComboboxContent>
            <ComboboxInput placeholder="Search frameworks..." />
            <ComboboxList>
              <ComboboxEmpty>No framework found.</ComboboxEmpty>
              {frameworks.map((fw) => (
                <ComboboxItem
                  key={fw.value}
                  value={fw.value}
                  onSelect={() => setSelected(fw.label)}
                >
                  {fw.label}
                </ComboboxItem>
              ))}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </CardContent>
    </Card>
  );
}

function SheetDemo() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sheet</CardTitle>
        <CardDescription>Side panel overlay</CardDescription>
      </CardHeader>
      <CardContent>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline">Open Sheet</Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Edit Profile</SheetTitle>
              <SheetDescription>Make changes to your profile here.</SheetDescription>
            </SheetHeader>
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem 0' }}
            >
              <Input placeholder="Name" />
              <Input placeholder="Email" />
            </div>
            <SheetFooter>
              <SheetClose asChild>
                <Button variant="outline">Cancel</Button>
              </SheetClose>
              <Button>Save changes</Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </CardContent>
    </Card>
  );
}

function NavigationMenuDemo() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>NavigationMenu</CardTitle>
        <CardDescription>Navigation with dropdown content</CardDescription>
      </CardHeader>
      <CardContent>
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Getting Started</NavigationMenuTrigger>
              <NavigationMenuContent>
                <div style={{ padding: '1rem', width: '16rem' }}>
                  <NavigationMenuLink href="#">Introduction</NavigationMenuLink>
                  <NavigationMenuLink href="#">Installation</NavigationMenuLink>
                  <NavigationMenuLink href="#">Usage</NavigationMenuLink>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Components</NavigationMenuTrigger>
              <NavigationMenuContent>
                <div style={{ padding: '1rem', width: '16rem' }}>
                  <NavigationMenuLink href="#">Button</NavigationMenuLink>
                  <NavigationMenuLink href="#">Card</NavigationMenuLink>
                  <NavigationMenuLink href="#">Dialog</NavigationMenuLink>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink href="#">Documentation</NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </CardContent>
    </Card>
  );
}

// Container-aware breakpoints (parent maxWidth: 48rem, Card padding reduces to ≈ 700px)
const bentoBreakpoints = { lg: 600, sm: 400, xs: 0 };
const bentoCols = { lg: 12, sm: 4, xs: 2 };

const bentoLayouts = {
  lg: [
    { i: 'stats', x: 0, y: 0, w: 3, h: 2 },
    { i: 'chart', x: 3, y: 0, w: 6, h: 4 },
    { i: 'activity', x: 9, y: 0, w: 3, h: 4 },
    { i: 'users', x: 0, y: 2, w: 3, h: 2 },
    { i: 'revenue', x: 0, y: 4, w: 6, h: 2 },
    { i: 'tasks', x: 6, y: 4, w: 6, h: 2 },
  ],
  sm: [
    { i: 'stats', x: 0, y: 0, w: 2, h: 2 },
    { i: 'chart', x: 2, y: 0, w: 2, h: 3 },
    { i: 'activity', x: 0, y: 2, w: 2, h: 3 },
    { i: 'users', x: 0, y: 5, w: 4, h: 2 },
    { i: 'revenue', x: 0, y: 7, w: 4, h: 2 },
    { i: 'tasks', x: 0, y: 9, w: 4, h: 2 },
  ],
  xs: [
    { i: 'stats', x: 0, y: 0, w: 2, h: 2 },
    { i: 'chart', x: 0, y: 2, w: 2, h: 3 },
    { i: 'activity', x: 0, y: 5, w: 2, h: 3 },
    { i: 'users', x: 0, y: 8, w: 2, h: 2 },
    { i: 'revenue', x: 0, y: 10, w: 2, h: 2 },
    { i: 'tasks', x: 0, y: 12, w: 2, h: 2 },
  ],
};

const bentoItems = [
  { key: 'stats', title: 'Total Users', value: '12,340', desc: '+12% from last month' },
  { key: 'chart', title: 'Revenue Chart', value: '$48,200', desc: 'Monthly revenue overview' },
  { key: 'activity', title: 'Recent Activity', value: '38', desc: 'Actions in the last hour' },
  { key: 'users', title: 'Active Now', value: '573', desc: 'Currently online' },
  { key: 'revenue', title: 'Monthly Revenue', value: '$142,500', desc: 'Across all products' },
  { key: 'tasks', title: 'Open Tasks', value: '24', desc: '8 due today' },
];

function BentoGridDemo() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>BentoGrid</CardTitle>
        <CardDescription>Dashboard layout with responsive grid</CardDescription>
      </CardHeader>
      <CardContent>
        <BentoGrid
          layouts={bentoLayouts}
          breakpoints={bentoBreakpoints}
          cols={bentoCols}
          rowHeight={80}
          gap={[12, 12]}
        >
          {bentoItems.map((item) => (
            <BentoGridItem key={item.key}>
              <Card style={{ height: '100%' }}>
                <CardHeader style={{ paddingBottom: '0.25rem' }}>
                  <CardDescription>{item.title}</CardDescription>
                  <CardTitle style={{ fontSize: '1.5rem' }}>{item.value}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p style={{ fontSize: '0.75rem', opacity: 0.7 }}>{item.desc}</p>
                </CardContent>
              </Card>
            </BentoGridItem>
          ))}
        </BentoGrid>
      </CardContent>
    </Card>
  );
}

function ChatDemo() {
  const [input, setInput] = useState('');
  const [userMessages, setUserMessages] = useState<{ id: string; text: string }[]>([]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setUserMessages((prev) => [...prev, { id: String(Date.now()), text: input }]);
    setInput('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Agent Chat</CardTitle>
        <CardDescription>
          ChatContainer, ChatMessage, StreamingText, ToolCallCard, ApprovalCard, ChatComposer
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div style={{ height: '44rem' }}>
          <ChatContainer>
            <ChatContainerHeader>Agent Chat</ChatContainerHeader>

            <ChatContainerMessages>
              {/* System message — centered, subtle */}
              <ChatMessage variant="system">
                <ChatMessageContent>Session started</ChatMessageContent>
              </ChatMessage>

              {/* User message — right-aligned, bubble background, no avatar */}
              <ChatMessage variant="user">
                <ChatMessageContent>Can you check the database schema?</ChatMessageContent>
              </ChatMessage>

              {/* Assistant message — full-width text, no bubble */}
              <ChatMessage variant="assistant">
                <ChatMessageContent>
                  I'll check the database schema. Let me fetch the table list first.
                </ChatMessageContent>
              </ChatMessage>

              {/* ToolCallCard — done */}
              <ToolCallCard
                toolName="query_database"
                status="done"
                args={{ query: 'SHOW TABLES' }}
                result={<span>users, orders, products (3 tables)</span>}
                duration={245}
                defaultExpanded
              />

              {/* Assistant message — follow-up after tool result */}
              <ChatMessage variant="assistant">
                <ChatMessageContent>
                  Found 3 tables: <code>users</code>, <code>orders</code>, <code>products</code>.
                  Let me analyze each table schema in detail.
                </ChatMessageContent>
              </ChatMessage>

              {/* ToolCallCard — args streaming */}
              <ToolCallCard
                toolName="analyze_schema"
                status="executing"
                args='{"table": "users", "depth'
                argsStreaming
                defaultExpanded
              />

              {/* ReasoningPanel — thinking */}
              <ReasoningPanel status="thinking" open>
                <StreamingText streaming cursor="pulse">
                  Checking column structure of the users table... found email, name, created_at. Now
                  verifying foreign key constraints...
                </StreamingText>
              </ReasoningPanel>

              {/* Assistant message — StreamingText usage */}
              <ChatMessage variant="assistant">
                <ChatMessageContent>
                  <StreamingText streaming cursor="blink">
                    Analyzing the schema...
                  </StreamingText>
                </ChatMessageContent>
              </ChatMessage>

              {/* ReasoningPanel — done (collapsed) */}
              <ReasoningPanel status="done">
                Analyzed the table structure and evaluated normalization level and index
                optimization potential. The users table conforms to third normal form.
              </ReasoningPanel>

              {/* User message — additional instruction */}
              <ChatMessage variant="user">
                <ChatMessageContent>
                  Can you add an email_verified column to the users table?
                </ChatMessageContent>
              </ChatMessage>

              {/* Assistant message — approval request explanation */}
              <ChatMessage variant="assistant">
                <ChatMessageContent>
                  Changes to the production database require approval. Please confirm whether to
                  proceed with the following operation.
                </ChatMessageContent>
              </ChatMessage>

              {/* ApprovalCard — pending */}
              <ApprovalCard
                title="Write to Production Database"
                description="Add a new column 'email_verified' (BOOLEAN, DEFAULT false) to the users table."
                risk="medium"
                onApprove={() => console.log('Approved')}
                onReject={() => console.log('Rejected')}
              />

              {/* ToolCallCard — error */}
              <ToolCallCard
                toolName="drop_table"
                status="error"
                error="Permission denied: DROP TABLE requires admin privileges"
                defaultExpanded
              />

              {/* ApprovalCard — approved */}
              <ApprovalCard
                title="Schema Change Complete"
                description="The email_verified column has been added."
                status="approved"
                risk="low"
              />

              {/* Dynamically added user messages */}
              {userMessages.map((msg) => (
                <ChatMessage key={msg.id} variant="user">
                  <ChatMessageContent>{msg.text}</ChatMessageContent>
                </ChatMessage>
              ))}
            </ChatContainerMessages>

            <ChatContainerFooter>
              <ChatComposer onSubmit={handleSubmit}>
                <ChatComposerInput
                  placeholder="Type a message..."
                  value={input}
                  onValueChange={setInput}
                />
                <ChatComposerActions>
                  <ChatComposerSend />
                </ChatComposerActions>
              </ChatComposer>
            </ChatContainerFooter>
          </ChatContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <div
        style={{
          maxWidth: '48rem',
          margin: '0 auto',
          padding: '2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
        }}
      >
        <h1>Hareru UI Playground</h1>
        <ThemeToggle />
        <ChatDemo />
        <TokensDemo />
        <BadgeDemo />
        <SkeletonDemo />
        <SeparatorDemo />
        <AvatarDemo />
        <ButtonDemo />
        <InputDemo />
        <TabsDemo />
        <CommandDemo />
        <ComboboxDemo />
        <SheetDemo />
        <NavigationMenuDemo />
        <DialogDemo />
        <CardDemo />
        <BentoGridDemo />
      </div>
    </ThemeProvider>
  );
}
