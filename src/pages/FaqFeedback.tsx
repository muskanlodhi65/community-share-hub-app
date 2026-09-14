import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { 
  HelpCircle, MessageSquare, Star, Search, Send, ThumbsUp, 
  Sparkles, CheckCircle2, ShieldCheck, HeartHandshake, Zap, ArrowLeft 
} from 'lucide-react';

interface FeedbackItem {
  id: string;
  name: string;
  role: string;
  rating: number;
  category: string;
  comment: string;
  date: string;
  likes: number;
}

const initialFeedbacks: FeedbackItem[] = [
  {
    id: '1',
    name: 'Aarav Sharma',
    role: 'Verified Member',
    rating: 5,
    category: 'General Experience',
    comment: 'EcoHub has completely changed how our neighborhood shares tools! I borrowed a lawn mower last weekend and saved over ₹3,000. Super smooth experience.',
    date: '2 days ago',
    likes: 12
  },
  {
    id: '2',
    name: 'Priya Patel',
    role: 'Community Moderator',
    rating: 5,
    category: 'Trust & Safety',
    comment: 'The user verification process makes borrowing items safe and hassle-free. Highly recommend everyone to list their unused household items!',
    date: '1 week ago',
    likes: 8
  },
  {
    id: '3',
    name: 'Rohan Mehta',
    role: 'Verified Member',
    rating: 4,
    category: 'Feature Request',
    comment: 'Love the text-to-speech voice feature for accessibility! It would be even better if we could add multiple photos per item.',
    date: '2 weeks ago',
    likes: 5
  }
];

const faqData = [
  {
    id: 'faq-1',
    category: 'Borrowing & Sharing',
    question: 'How do I borrow an item from EcoHub?',
    answer: 'Simply browse the marketplace, click on an item you need, select your desired start and end dates, and send a borrow request to the item owner. Once approved, you can arrange a convenient pickup!'
  },
  {
    id: 'faq-2',
    category: 'Borrowing & Sharing',
    question: 'Is listing and borrowing free on EcoHub?',
    answer: 'Yes! Community resource sharing on EcoHub is 100% free with zero listing fees. Some owners may set a nominal refundable security deposit or daily rental rate if specified on their listing.'
  },
  {
    id: 'faq-3',
    category: 'Trust & Safety',
    question: 'How does member verification work?',
    answer: 'Members verify their identity via phone/email and community reviews. Verified badges build trust across neighbors, ensuring items are handled with care and returned safely on time.'
  },
  {
    id: 'faq-4',
    category: 'Trust & Safety',
    question: 'What happens if an item gets damaged or returned late?',
    answer: 'Borrowers agree to our Community Sharing Policy before requesting items. In case of damages or delays, owners can report to community moderators who help mediate repairs, replacements, or account suspensions.'
  },
  {
    id: 'faq-5',
    category: 'Eco Points & Rewards',
    question: 'What are Eco Points and how do I earn them?',
    answer: 'Eco Points reward sustainable behavior! You earn points every time you list an item, successfully lend equipment, or leave verified community feedback. Points unlock special community badges and leaderboard rankings.'
  },
  {
    id: 'faq-6',
    category: 'Account & Support',
    question: 'How can I switch my access role (Member, Moderator, Admin)?',
    answer: 'You can test role-based access by clicking the Sign In button on the navigation bar, selecting your desired access role tab (Member, Moderator, System Admin), and using the instant demo credentials!'
  }
];

const FaqFeedback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>(initialFeedbacks);
  
  // New Feedback Form state
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('Member');
  const [rating, setRating] = useState(5);
  const [category, setCategory] = useState('General Experience');
  const [comment, setComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0);

  const filteredFaqs = faqData.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();

    if (!userName.trim() || !comment.trim()) {
      toast({
        title: 'Fields required',
        description: 'Please enter your name and feedback comment.',
        variant: 'destructive',
      });
      return;
    }

    const newEntry: FeedbackItem = {
      id: Date.now().toString(),
      name: userName.trim(),
      role: userRole,
      rating,
      category,
      comment: comment.trim(),
      date: 'Just now',
      likes: 0
    };

    setFeedbacks([newEntry, ...feedbacks]);
    setUserName('');
    setComment('');
    setRating(5);

    toast({
      title: 'Feedback Submitted! 🎉',
      description: 'Thank you for sharing your thoughts with the EcoHub community.',
    });
  };

  const handleLike = (id: string) => {
    setFeedbacks(prev => 
      prev.map(item => item.id === id ? { ...item, likes: item.likes + 1 } : item)
    );
    toast({
      title: 'Feedback Appreciated 👍',
      description: 'You marked this feedback as helpful.',
    });
  };

  return (
    <MainLayout>
      {/* Header Banner */}
      <section className="bg-gradient-to-br from-primary/15 via-background to-secondary/30 py-16 border-b">
        <div className="container mx-auto px-4 text-center max-w-3xl space-y-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/')} 
            className="mb-2 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Home Page
          </Button>

          <Badge variant="outline" className="px-4 py-1 rounded-full border-primary/30 bg-primary/10 text-primary text-xs font-bold gap-1.5">
            <Sparkles className="h-3.5 w-3.5" /> Help Center & Community Voice
          </Badge>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
            Frequently Asked Questions & <span className="eco-gradient-text">Feedbacks</span>
          </h1>

          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            Find answers to common questions about EcoHub resource sharing or share your feedback and ratings to help improve our community platform.
          </p>

          {/* Quick FAQ Search input */}
          <div className="relative max-w-lg mx-auto pt-4">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search questions (e.g. borrowing, security, points)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 rounded-xl border-2 shadow-xs bg-background/90"
            />
          </div>
        </div>
      </section>

      {/* Main Content Tabs (FAQs vs Feedbacks) */}
      <section className="container mx-auto px-4 py-12">
        <Tabs defaultValue="faqs" className="w-full">
          <div className="flex justify-center mb-10">
            <TabsList className="grid grid-cols-2 w-full max-w-md h-12 p-1 bg-muted/80 rounded-xl">
              <TabsTrigger value="faqs" className="rounded-lg font-bold text-xs sm:text-sm gap-2">
                <HelpCircle className="h-4 w-4 text-primary" /> Answered Questions (FAQs)
              </TabsTrigger>
              <TabsTrigger value="feedback" className="rounded-lg font-bold text-xs sm:text-sm gap-2">
                <MessageSquare className="h-4 w-4 text-emerald-600" /> Give & View Feedbacks
              </TabsTrigger>
            </TabsList>
          </div>

          {/* TAB 1: FAQ / ANSWER QUESTIONS */}
          <TabsContent value="faqs" className="space-y-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                  <HelpCircle className="h-6 w-6 text-primary" /> Questions & Answers
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">Everything you need to know about sharing on EcoHub</p>
              </div>
              <Badge variant="secondary" className="font-semibold text-xs">
                {filteredFaqs.length} Questions
              </Badge>
            </div>

            {filteredFaqs.length > 0 ? (
              <Accordion type="single" collapsible className="w-full space-y-3">
                {filteredFaqs.map((faq) => (
                  <AccordionItem 
                    key={faq.id} 
                    value={faq.id}
                    className="border rounded-2xl px-6 bg-card shadow-xs transition-all hover:border-primary/40 hover:shadow-md"
                  >
                    <AccordionTrigger className="text-left font-bold text-base py-4 hover:no-underline">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="text-[10px] uppercase font-bold text-primary border-primary/30">
                          {faq.category}
                        </Badge>
                        <span>{faq.question}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground leading-relaxed pt-1 pb-5 border-t">
                      <div className="flex gap-2 items-start mt-2">
                        <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                        <p>{faq.answer}</p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <div className="text-center py-12 p-8 border rounded-2xl bg-card/50">
                <HelpCircle className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
                <p className="font-semibold text-muted-foreground">No questions found matching "{searchQuery}"</p>
                <Button variant="outline" size="sm" onClick={() => setSearchQuery('')} className="mt-3">
                  Clear Search Filter
                </Button>
              </div>
            )}

            {/* Need More Help Box */}
            <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 via-background to-emerald-500/5 p-6 rounded-2xl">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center sm:text-left">
                  <h3 className="font-bold text-lg flex items-center justify-center sm:justify-start gap-2">
                    <ShieldCheck className="h-5 w-5 text-primary" /> Have a unique question?
                  </h3>
                  <p className="text-xs text-muted-foreground">Submit your query in the Feedback tab and our moderators will assist you.</p>
                </div>
                <Button onClick={() => {
                  const feedbackTab = document.querySelector('[data-value="feedback"]') as HTMLElement;
                  if (feedbackTab) feedbackTab.click();
                }} className="gap-2 font-bold shadow-xs">
                  <MessageSquare className="h-4 w-4" /> Ask / Give Feedback
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* TAB 2: FEEDBACK FORM & REVIEWS WALL */}
          <TabsContent value="feedback" className="space-y-10 max-w-5xl mx-auto">
            <div className="grid lg:grid-cols-12 gap-8">
              
              {/* Left Column: Submit New Feedback Form */}
              <div className="lg:col-span-5">
                <Card className="border-2 shadow-lg sticky top-24">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                      <Send className="h-5 w-5 text-primary" /> Submit Feedback
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Share your experience, feature requests, or report an issue
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmitFeedback} className="space-y-4">
                      {/* Name input */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          Your Full Name
                        </label>
                        <Input
                          placeholder="e.g. Ananya Roy"
                          value={userName}
                          onChange={(e) => setUserName(e.target.value)}
                          required
                          className="text-xs"
                        />
                      </div>

                      {/* Role selection */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          Your Role
                        </label>
                        <select
                          value={userRole}
                          onChange={(e) => setUserRole(e.target.value)}
                          className="w-full h-9 px-3 rounded-md border border-input bg-background text-xs"
                        >
                          <option value="Verified Member">Verified Member</option>
                          <option value="Item Lender">Item Lender / Owner</option>
                          <option value="Borrower">Borrower</option>
                          <option value="Community Moderator">Community Moderator</option>
                        </select>
                      </div>

                      {/* Category selection */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          Feedback Topic
                        </label>
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="w-full h-9 px-3 rounded-md border border-input bg-background text-xs"
                        >
                          <option value="General Experience">General Experience</option>
                          <option value="Trust & Safety">Trust & Safety</option>
                          <option value="Feature Request">Feature Request</option>
                          <option value="Bug / Technical Issue">Bug / Technical Issue</option>
                        </select>
                      </div>

                      {/* Interactive Star Rating */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          Rating Score
                        </label>
                        <div className="flex items-center gap-1 bg-muted/40 p-2 rounded-lg border">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setRating(star)}
                              onMouseEnter={() => setHoverRating(star)}
                              onMouseLeave={() => setHoverRating(0)}
                              className="p-1 hover:scale-110 transition-transform focus:outline-hidden"
                            >
                              <Star 
                                className={`h-6 w-6 ${
                                  (hoverRating || rating) >= star 
                                    ? 'fill-amber-400 text-amber-400' 
                                    : 'text-muted-foreground/40'
                                }`} 
                              />
                            </button>
                          ))}
                          <span className="ml-auto text-xs font-extrabold text-amber-600 dark:text-amber-400 pr-1">
                            {rating} / 5 Stars
                          </span>
                        </div>
                      </div>

                      {/* Comment textarea */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          Detailed Feedback
                        </label>
                        <Textarea
                          placeholder="Tell us what you loved or how we can improve EcoHub..."
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          rows={4}
                          required
                          className="text-xs resize-none"
                        />
                      </div>

                      <Button type="submit" className="w-full font-bold shadow-md gap-2">
                        <Send className="h-4 w-4" /> Submit Feedback
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column: Community Feedback Wall */}
              <div className="lg:col-span-7 space-y-6">
                <div className="flex items-center justify-between border-b pb-3">
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                      <HeartHandshake className="h-6 w-6 text-emerald-600" /> Community Wall
                    </h2>
                    <p className="text-xs text-muted-foreground">Real reviews & suggestions from community users</p>
                  </div>
                  <Badge variant="outline" className="font-bold border-emerald-500/40 text-emerald-600">
                    <Zap className="h-3 w-3 mr-1 fill-emerald-600" /> {feedbacks.length} Feedback Posts
                  </Badge>
                </div>

                <div className="space-y-4">
                  {feedbacks.map((item) => (
                    <Card key={item.id} className="border shadow-xs hover:shadow-md transition-shadow">
                      <CardContent className="p-5 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9 ring-2 ring-primary/20">
                              <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                                {item.name.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-sm leading-none">{item.name}</h4>
                                <Badge variant="secondary" className="text-[10px] py-0 px-2 font-medium">
                                  {item.role}
                                </Badge>
                              </div>
                              <span className="text-[11px] text-muted-foreground">{item.date}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 bg-amber-500/10 px-2 py-1 rounded-md border border-amber-200">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`h-3.5 w-3.5 ${
                                  i < item.rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'
                                }`} 
                              />
                            ))}
                          </div>
                        </div>

                        <p className="text-xs text-foreground leading-relaxed bg-muted/30 p-3 rounded-xl border border-border/60">
                          "{item.comment}"
                        </p>

                        <div className="flex items-center justify-between pt-1 text-xs">
                          <Badge variant="outline" className="text-[10px] font-semibold text-muted-foreground">
                            {item.category}
                          </Badge>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleLike(item.id)}
                            className="h-7 text-xs gap-1.5 text-muted-foreground hover:text-emerald-600"
                          >
                            <ThumbsUp className="h-3.5 w-3.5" /> Helpful ({item.likes})
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

            </div>
          </TabsContent>
        </Tabs>
      </section>
    </MainLayout>
  );
};

export default FaqFeedback;
