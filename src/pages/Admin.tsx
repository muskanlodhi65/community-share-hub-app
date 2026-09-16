import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { 
  Users, 
  Package, 
  ClipboardList, 
  TrendingUp, 
  CheckCircle, 
  XCircle, 
  Loader2,
  Shield,
  Ban,
  UserCheck,
  Eye,
  MessageSquare,
  Mail,
  Trash2,
  Clock,
  CheckCheck,
  RefreshCw
} from 'lucide-react';

interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  is_verified: boolean | null;
  is_suspended: boolean | null;
  created_at: string;
}

interface ItemForVerification {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  condition: string | null;
  is_verified: boolean | null;
  created_at: string;
  owner_id: string;
  profiles: { full_name: string | null } | null;
  categories: { name: string } | null;
}

export interface UserQuery {
  ticketId: string;
  name: string;
  email: string;
  topic: string;
  message: string;
  date: string;
  status: 'Pending' | 'In Review' | 'Resolved';
}

interface PlatformStats {
  totalUsers: number;
  totalItems: number;
  totalRequests: number;
  pendingVerifications: number;
  activeLoans: number;
  completedLoans: number;
  totalQueries: number;
}

const Admin = () => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<Profile[]>([]);
  const [items, setItems] = useState<ItemForVerification[]>([]);
  const [queries, setQueries] = useState<UserQuery[]>([]);
  const [queryFilter, setQueryFilter] = useState<string>('all');
  const [stats, setStats] = useState<PlatformStats>({
    totalUsers: 0,
    totalItems: 0,
    totalRequests: 0,
    pendingVerifications: 0,
    activeLoans: 0,
    completedLoans: 0,
    totalQueries: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchUsers(), fetchItems(), fetchQueries(), fetchStats()]);
    setLoading(false);
  };

  const fetchQueries = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/queries');
      const data = await res.json();
      if (data.success && data.data && data.data.length > 0) {
        const list: UserQuery[] = data.data.map((q: any) => ({
          ticketId: q.ticketId || ('ECO-' + Math.random().toString().slice(2, 8)),
          name: q.name,
          email: q.email,
          topic: q.category || q.topic || 'General Queries',
          message: q.message,
          date: q.createdAt || q.date || new Date().toISOString(),
          status: q.status === 'received' ? 'Pending' : (q.status || 'Pending'),
        }));
        setQueries(list);
        return;
      }
    } catch {
      // safe fallback
    }

    try {
      const local = JSON.parse(localStorage.getItem('ecohub_user_queries') || '[]');
      setQueries(local);
    } catch {
      setQueries([]);
    }
  };

  const fetchUsers = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setUsers(data);
  };

  const fetchItems = async () => {
    const { data } = await supabase
      .from('items')
      .select(`
        id,
        title,
        description,
        image_url,
        condition,
        is_verified,
        created_at,
        owner_id,
        profiles:owner_id (full_name),
        categories (name)
      `)
      .order('created_at', { ascending: false });
    
    if (data) setItems(data as unknown as ItemForVerification[]);
  };

  const fetchStats = async () => {
    const [usersCount, itemsCount, requestsCount, pendingItems, activeLoans, completedLoans] = await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('items').select('id', { count: 'exact', head: true }),
      supabase.from('borrow_requests').select('id', { count: 'exact', head: true }),
      supabase.from('items').select('id', { count: 'exact', head: true }).eq('is_verified', false),
      supabase.from('borrow_requests').select('id', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('borrow_requests').select('id', { count: 'exact', head: true }).eq('status', 'returned'),
    ]);

    setStats({
      totalUsers: usersCount.count || 0,
      totalItems: itemsCount.count || 0,
      totalRequests: requestsCount.count || 0,
      pendingVerifications: pendingItems.count || 0,
      activeLoans: activeLoans.count || 0,
      completedLoans: completedLoans.count || 0,
    });
  };

  const toggleUserSuspension = async (userId: string, currentStatus: boolean | null) => {
    const { error } = await supabase
      .from('profiles')
      .update({ is_suspended: !currentStatus })
      .eq('id', userId);
    
    if (error) {
      toast.error('Failed to update user status');
    } else {
      toast.success(currentStatus ? 'User unsuspended' : 'User suspended');
      fetchUsers();
    }
  };

  const toggleUserVerification = async (userId: string, currentStatus: boolean | null) => {
    const { error } = await supabase
      .from('profiles')
      .update({ is_verified: !currentStatus })
      .eq('id', userId);
    
    if (error) {
      toast.error('Failed to update verification status');
    } else {
      toast.success(currentStatus ? 'User unverified' : 'User verified');
      fetchUsers();
    }
  };

  const toggleItemVerification = async (itemId: string, currentStatus: boolean | null) => {
    const { error } = await supabase
      .from('items')
      .update({ is_verified: !currentStatus })
      .eq('id', itemId);
    
    if (error) {
      toast.error('Failed to update item verification');
    } else {
      toast.success(currentStatus ? 'Item unverified' : 'Item verified');
      fetchItems();
      fetchStats();
    }
  };

  const updateQueryStatus = (ticketId: string, newStatus: 'Pending' | 'In Review' | 'Resolved') => {
    setQueries(prev => {
      const updated = prev.map(q => q.ticketId === ticketId ? { ...q, status: newStatus } : q);
      try {
        localStorage.setItem('ecohub_user_queries', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    toast.success(`Query #${ticketId} marked as ${newStatus}`);
  };

  const deleteQuery = (ticketId: string) => {
    setQueries(prev => {
      const updated = prev.filter(q => q.ticketId !== ticketId);
      try {
        localStorage.setItem('ecohub_user_queries', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    toast.success(`Query #${ticketId} deleted`);
  };

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage users, items, and platform settings</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1">
                <Users className="h-4 w-4" /> Total Users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1">
                <Package className="h-4 w-4" /> Total Items
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalItems}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1">
                <ClipboardList className="h-4 w-4" /> Total Requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRequests}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1">
                <Eye className="h-4 w-4" /> Pending Verification
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">{stats.pendingVerifications}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4" /> Active Loans
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.activeLoans}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4" /> Completed Loans
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.completedLoans}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4 text-emerald-600" /> User Queries
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">{queries.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for User, Item, and Query Management */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full max-w-xl grid-cols-3">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" /> Users
            </TabsTrigger>
            <TabsTrigger value="items" className="flex items-center gap-2">
              <Package className="h-4 w-4" /> Items
            </TabsTrigger>
            <TabsTrigger value="queries" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" /> User Queries
              {queries.length > 0 && (
                <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                  {queries.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>All Users</CardTitle>
                <CardDescription>Manage user accounts, verification, and suspension status</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map(user => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarImage src={user.avatar_url || undefined} />
                              <AvatarFallback className="bg-primary/10 text-primary">
                                {getInitials(user.full_name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{user.full_name || 'Unnamed User'}</p>
                              <p className="text-xs text-muted-foreground">ID: {user.id.slice(0, 8)}...</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{formatDate(user.created_at)}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {user.is_verified && (
                              <Badge variant="default" className="bg-green-600">
                                <CheckCircle className="h-3 w-3 mr-1" /> Verified
                              </Badge>
                            )}
                            {user.is_suspended && (
                              <Badge variant="destructive">
                                <Ban className="h-3 w-3 mr-1" /> Suspended
                              </Badge>
                            )}
                            {!user.is_verified && !user.is_suspended && (
                              <Badge variant="secondary">Active</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant={user.is_verified ? "outline" : "default"}
                              onClick={() => toggleUserVerification(user.id, user.is_verified)}
                            >
                              <UserCheck className="h-4 w-4 mr-1" />
                              {user.is_verified ? 'Unverify' : 'Verify'}
                            </Button>
                            <Button
                              size="sm"
                              variant={user.is_suspended ? "outline" : "destructive"}
                              onClick={() => toggleUserSuspension(user.id, user.is_suspended)}
                            >
                              <Ban className="h-4 w-4 mr-1" />
                              {user.is_suspended ? 'Unsuspend' : 'Suspend'}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {users.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No users found
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Items Tab */}
          <TabsContent value="items">
            <Card>
              <CardHeader>
                <CardTitle>Item Verification</CardTitle>
                <CardDescription>Review and verify items listed on the platform</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Listed</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map(item => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                              {item.image_url ? (
                                <img 
                                  src={item.image_url} 
                                  alt={item.title}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center">
                                  <Package className="h-6 w-6 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{item.title}</p>
                              <p className="text-xs text-muted-foreground capitalize">{item.condition}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{item.profiles?.full_name || 'Unknown'}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.categories?.name || 'Uncategorized'}</Badge>
                        </TableCell>
                        <TableCell>{formatDate(item.created_at)}</TableCell>
                        <TableCell>
                          {item.is_verified ? (
                            <Badge variant="default" className="bg-green-600">
                              <CheckCircle className="h-3 w-3 mr-1" /> Verified
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              <XCircle className="h-3 w-3 mr-1" /> Pending
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant={item.is_verified ? "outline" : "default"}
                            onClick={() => toggleItemVerification(item.id, item.is_verified)}
                          >
                            {item.is_verified ? (
                              <>
                                <XCircle className="h-4 w-4 mr-1" /> Unverify
                              </>
                            ) : (
                              <>
                                <CheckCircle className="h-4 w-4 mr-1" /> Verify
                              </>
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {items.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No items found
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* User Queries Tab */}
          <TabsContent value="queries">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-emerald-600" />
                      User Queries & Support Tickets
                    </CardTitle>
                    <CardDescription>
                      Review incoming queries from the homepage contact form, filter by category, and reply directly to users
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchQueries}
                    className="gap-1.5 w-fit cursor-pointer"
                  >
                    <RefreshCw className="h-3.5 w-3.5" /> Refresh
                  </Button>
                </div>

                {/* Topic Filters */}
                <div className="flex items-center gap-2 pt-3 flex-wrap">
                  <span className="text-xs font-semibold text-muted-foreground mr-1">Filter:</span>
                  {[
                    { id: 'all', label: 'All Queries' },
                    { id: 'General Queries', label: 'General' },
                    { id: 'Trust & Safety', label: 'Trust & Safety' },
                    { id: 'Feature Suggestions', label: 'Feature Suggestions' },
                    { id: 'Partnership', label: 'Partnership' },
                  ].map(tab => (
                    <Button
                      key={tab.id}
                      variant={queryFilter === tab.id ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setQueryFilter(tab.id)}
                      className="h-7 text-xs rounded-full cursor-pointer"
                    >
                      {tab.label}
                    </Button>
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ticket & Date</TableHead>
                      <TableHead>User / Contact</TableHead>
                      <TableHead>Topic</TableHead>
                      <TableHead className="max-w-md">Message</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {queries
                      .filter(q => queryFilter === 'all' || q.topic.toLowerCase().includes(queryFilter.toLowerCase()) || q.topic === queryFilter)
                      .map((q) => {
                        const getTopicBadgeClass = (topic: string) => {
                          if (topic.includes('Safety')) return 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20';
                          if (topic.includes('Feature')) return 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20';
                          if (topic.includes('Partnership')) return 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20';
                          return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20';
                        };

                        const getStatusBadge = (status: string) => {
                          if (status === 'Resolved') {
                            return <Badge className="bg-green-600 text-white gap-1"><CheckCheck className="h-3 w-3" /> Resolved</Badge>;
                          }
                          if (status === 'In Review') {
                            return <Badge className="bg-blue-600 text-white gap-1"><Clock className="h-3 w-3" /> In Review</Badge>;
                          }
                          return <Badge variant="outline" className="text-amber-600 border-amber-400 bg-amber-50 dark:bg-amber-950/20 gap-1"><Clock className="h-3 w-3" /> Pending</Badge>;
                        };

                        return (
                          <TableRow key={q.ticketId}>
                            <TableCell>
                              <div className="font-mono font-bold text-xs text-primary">#{q.ticketId}</div>
                              <div className="text-[11px] text-muted-foreground">{formatDate(q.date)}</div>
                            </TableCell>
                            <TableCell>
                              <div className="font-semibold text-sm">{q.name}</div>
                              <div className="text-xs text-muted-foreground font-mono">{q.email}</div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={`text-xs ${getTopicBadgeClass(q.topic)}`}>
                                {q.topic}
                              </Badge>
                            </TableCell>
                            <TableCell className="max-w-xs sm:max-w-md">
                              <p className="text-sm line-clamp-3 text-foreground/90 whitespace-pre-wrap">{q.message}</p>
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(q.status)}
                            </TableCell>
                            <TableCell className="text-right space-x-1.5 whitespace-nowrap">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 gap-1 cursor-pointer"
                                onClick={() => window.open(`mailto:${q.email}?subject=Response to EcoHub Query #${q.ticketId} - ${q.topic}&body=Hi ${q.name},%0D%0A%0D%0AThank you for contacting EcoHub regarding "${q.topic}".%0D%0A%0D%0A`)}
                              >
                                <Mail className="h-3.5 w-3.5" /> Reply
                              </Button>
                              <Button
                                size="sm"
                                variant={q.status === 'Resolved' ? 'secondary' : 'default'}
                                className="h-8 cursor-pointer"
                                onClick={() => updateQueryStatus(q.ticketId, q.status === 'Resolved' ? 'Pending' : 'Resolved')}
                              >
                                {q.status === 'Resolved' ? 'Reopen' : 'Resolve'}
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-destructive hover:bg-destructive/10 cursor-pointer"
                                onClick={() => deleteQuery(q.ticketId)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
                {queries.length === 0 && (
                  <div className="text-center py-12 space-y-2">
                    <MessageSquare className="h-10 w-10 text-muted-foreground mx-auto opacity-40" />
                    <p className="font-medium text-muted-foreground">No queries submitted yet</p>
                    <p className="text-xs text-muted-foreground">When users submit questions on the homepage form, they will appear here.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Admin;
