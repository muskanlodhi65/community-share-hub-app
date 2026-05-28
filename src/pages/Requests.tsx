import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Loader2, ClipboardList, Check, X, Calendar, User, MessageSquare, CreditCard, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PaymentModal } from '@/components/payment/PaymentModal';

interface BorrowRequest {
  id: string;
  status: string;
  start_date: string;
  end_date: string;
  request_message: string | null;
  created_at: string;
  payment_status?: string;
  transaction_id?: string;
  items: { id: string; title: string; image_url: string | null; deposit_amount: number | null; price: number | null; listing_type: string } | null;
  profiles: { full_name: string | null; avatar_url: string | null } | null;
}

const statusColors: Record<string, string> = {
  pending: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-300',
  approved: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-300',
  rejected: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-300',
  active: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-300',
  returned: 'bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-300'
};

const Requests = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [myRequests, setMyRequests] = useState<BorrowRequest[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<BorrowRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Payment Modal State
  const [selectedReqForPayment, setSelectedReqForPayment] = useState<BorrowRequest | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  useEffect(() => {
    if (user) fetchRequests();
  }, [user]);

  const fetchRequests = async () => {
    // My borrow requests
    const { data: myData } = await supabase
      .from('borrow_requests')
      .select('*, items (id, title, image_url, deposit_amount, price, listing_type), profiles:borrower_id (full_name, avatar_url)')
      .eq('borrower_id', user!.id)
      .order('created_at', { ascending: false });

    if (myData) setMyRequests(myData as unknown as BorrowRequest[]);

    // Incoming requests for my items
    const { data: incoming } = await supabase
      .from('borrow_requests')
      .select('*, items!inner (id, title, image_url, owner_id, deposit_amount, price, listing_type), profiles:borrower_id (full_name, avatar_url)')
      .eq('items.owner_id', user!.id)
      .order('created_at', { ascending: false });

    if (incoming) setIncomingRequests(incoming as unknown as BorrowRequest[]);
    setLoading(false);
  };

  const updateRequestStatus = async (requestId: string, status: string) => {
    setUpdatingId(requestId);
    const { error } = await supabase
      .from('borrow_requests')
      .update({ status })
      .eq('id', requestId);

    setUpdatingId(null);

    if (error) {
      toast({ title: 'Error updating request', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: `Request ${status.toUpperCase()}`, description: `Borrow request status updated.` });
      fetchRequests();
    }
  };

  const handlePaymentCompleted = (reqId: string, txnId: string) => {
    // Local update state
    setMyRequests(prev => prev.map(r => r.id === reqId ? { ...r, payment_status: 'paid', transaction_id: txnId, status: 'active' } : r));
    fetchRequests();
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight mb-1">Borrow Requests & Payments</h1>
          <p className="text-muted-foreground text-sm">
            Track borrowing requests, manage incoming approvals, and pay advance deposits securely.
          </p>
        </div>

        <Tabs defaultValue="incoming" className="w-full">
          <TabsList className="mb-6 grid grid-cols-2 w-full max-w-md">
            <TabsTrigger value="incoming">
              Incoming ({incomingRequests.length})
            </TabsTrigger>
            <TabsTrigger value="my-requests">
              My Sent Requests ({myRequests.length})
            </TabsTrigger>
          </TabsList>

          {/* Incoming Requests for My Listed Items */}
          <TabsContent value="incoming">
            {incomingRequests.length === 0 ? (
              <div className="text-center py-20 bg-card rounded-2xl border border-dashed p-8">
                <ClipboardList className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-bold mb-1">No incoming borrow requests</h3>
                <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                  When community members request to borrow your listed items, they will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {incomingRequests.map(req => (
                  <Card key={req.id} className="border rounded-2xl overflow-hidden hover:border-primary/40 transition-all">
                    <CardHeader className="p-4 bg-muted/30 pb-3 flex flex-row items-center justify-between">
                      <div>
                        <CardTitle className="text-base font-bold">
                          <Link to={`/item/${req.items?.id}`} className="hover:text-primary transition-colors">
                            {req.items?.title}
                          </Link>
                        </CardTitle>
                        <CardDescription className="text-xs flex items-center gap-1.5 mt-0.5">
                          <User className="h-3.5 w-3.5 text-primary" /> Requested by <strong className="text-foreground">{req.profiles?.full_name || 'Community Member'}</strong>
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        {req.payment_status === 'paid' && (
                          <Badge className="bg-emerald-600 text-white gap-1 text-xs">
                            <CheckCircle2 className="h-3 w-3" /> Advance Paid
                          </Badge>
                        )}
                        <Badge variant="outline" className={`capitalize text-xs px-2.5 py-0.5 font-semibold ${statusColors[req.status] || ''}`}>
                          {req.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="p-4 pt-3 space-y-3">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-4 w-4 text-primary shrink-0" />
                        <span>Borrow Period: <strong>{format(new Date(req.start_date), 'MMM d, yyyy')}</strong> to <strong>{format(new Date(req.end_date), 'MMM d, yyyy')}</strong></span>
                      </div>

                      {req.request_message && (
                        <div className="bg-muted/50 p-3 rounded-xl text-xs border space-y-1">
                          <span className="font-semibold text-foreground flex items-center gap-1">
                            <MessageSquare className="h-3.5 w-3.5 text-primary" /> Note from borrower:
                          </span>
                          <p className="italic text-muted-foreground">"{req.request_message}"</p>
                        </div>
                      )}

                      {req.status === 'pending' && (
                        <div className="flex items-center gap-3 pt-2">
                          <Button 
                            size="sm" 
                            onClick={() => updateRequestStatus(req.id, 'approved')}
                            disabled={updatingId === req.id}
                            className="gap-1 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                          >
                            {updatingId === req.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />} Approve Request
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => updateRequestStatus(req.id, 'rejected')}
                            disabled={updatingId === req.id}
                            className="gap-1 text-xs text-destructive hover:text-destructive"
                          >
                            <X className="h-3.5 w-3.5" /> Reject
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Requests Submitted By Me */}
          <TabsContent value="my-requests">
            {myRequests.length === 0 ? (
              <div className="text-center py-20 bg-card rounded-2xl border border-dashed p-8">
                <ClipboardList className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-bold mb-1">No sent requests yet</h3>
                <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-6">
                  Find items you need on the marketplace and send borrow requests.
                </p>
                <Button asChild>
                  <Link to="/browse">Browse Marketplace</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {myRequests.map(req => {
                  const reqDeposit = req.items?.deposit_amount || 0;
                  const reqPrice = req.items?.price || 0;
                  const isSale = req.items?.listing_type === 'sale';
                  const payableAmount = isSale ? reqPrice : reqDeposit;
                  const isPaid = req.payment_status === 'paid';

                  return (
                    <Card key={req.id} className="border rounded-2xl overflow-hidden">
                      <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <h3 className="font-bold text-base">
                            <Link to={`/item/${req.items?.id}`} className="hover:text-primary transition-colors">
                              {req.items?.title}
                            </Link>
                          </h3>
                          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-primary" />
                            {format(new Date(req.start_date), 'MMM d')} - {format(new Date(req.end_date), 'MMM d, yyyy')}
                          </p>
                          {payableAmount > 0 && (
                            <p className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold">
                              Advance Required: ${payableAmount.toFixed(2)}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                          {isPaid ? (
                            <Badge className="bg-emerald-600 text-white gap-1 text-xs py-1 px-2.5">
                              <CheckCircle2 className="h-3.5 w-3.5" /> Advance Paid
                            </Badge>
                          ) : req.status === 'approved' && payableAmount > 0 ? (
                            <Button
                              size="sm"
                              className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm"
                              onClick={() => {
                                setSelectedReqForPayment(req);
                                setIsPaymentModalOpen(true);
                              }}
                            >
                              <CreditCard className="h-4 w-4" /> Pay Advance (${payableAmount.toFixed(2)})
                            </Button>
                          ) : null}

                          <Badge variant="outline" className={`capitalize text-xs px-3 py-1 font-semibold ${statusColors[req.status] || ''}`}>
                            {req.status}
                          </Badge>
                          <Button size="sm" variant="ghost" asChild className="text-xs">
                            <Link to={`/item/${req.items?.id}`}>View Item</Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Payment Modal Component */}
        {selectedReqForPayment && (
          <PaymentModal
            isOpen={isPaymentModalOpen}
            onClose={() => {
              setIsPaymentModalOpen(false);
              setSelectedReqForPayment(null);
            }}
            itemTitle={selectedReqForPayment.items?.title || 'Item'}
            amount={(selectedReqForPayment.items?.listing_type === 'sale' ? selectedReqForPayment.items?.price : selectedReqForPayment.items?.deposit_amount) || 0}
            paymentType={selectedReqForPayment.items?.listing_type === 'sale' ? 'purchase' : 'deposit'}
            onPaymentSuccess={(details) => handlePaymentCompleted(selectedReqForPayment.id, details.transactionId)}
          />
        )}
      </div>
    </MainLayout>
  );
};

export default Requests;

