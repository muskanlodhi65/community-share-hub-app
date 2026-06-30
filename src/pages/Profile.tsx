import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, User, CheckCircle2, Save, MapPin, Phone, Mail, ShieldAlert, ArrowLeft } from 'lucide-react';

const Profile = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [bio, setBio] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || 'Amit Sharma');
      setAvatarUrl(profile.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop');
      setBio(profile.bio || 'Passionate about sustainable living & resource sharing in our local community. Happy to lend power tools, camping gear, and kitchen appliances!');
      setPhone(profile.phone || '+91 98765 43210');
      setAddress(profile.address || 'Flat 402, Green Park Apartments, Sector 62');
    } else {
      setFullName('Amit Sharma');
      setAvatarUrl('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop');
      setBio('Passionate about sustainable living & resource sharing in our local community. Happy to lend power tools, camping gear, and kitchen appliances!');
      setPhone('+91 98765 43210');
      setAddress('Flat 402, Green Park Apartments, Sector 62');
    }
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName.trim() || null,
        avatar_url: avatarUrl.trim() || null,
        bio: bio.trim() || null,
        phone: phone.trim() || null,
        address: address.trim() || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    setSaving(false);

    if (error) {
      toast({
        title: 'Update failed',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Profile updated!',
        description: 'Your profile details have been saved successfully.',
      });
    }
  };

  if (authLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Profile Sidebar Overview */}
          <Card className="md:col-span-1 border-2">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 relative">
                <Avatar className="h-24 w-24 mx-auto border-4 border-primary/20 shadow-md">
                  <AvatarImage src={avatarUrl || undefined} alt={fullName} />
                  <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                    {getInitials(fullName)}
                  </AvatarFallback>
                </Avatar>
                {profile?.is_verified && (
                  <Badge className="absolute bottom-0 right-1/2 translate-x-1/2 translate-y-1/2 bg-primary text-primary-foreground gap-1 text-xs py-0.5">
                    <CheckCircle2 className="h-3 w-3" /> Verified
                  </Badge>
                )}
              </div>
              <CardTitle className="text-xl">{fullName || 'User Profile'}</CardTitle>
              <CardDescription className="flex items-center justify-center gap-1 mt-1 text-xs">
                <Mail className="h-3 w-3" /> {user?.email}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm pt-2 border-t">
              {address && (
                <div className="flex items-start gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                  <span>{address}</span>
                </div>
              )}
              {phone && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4 shrink-0 text-primary" />
                  <span>{phone}</span>
                </div>
              )}
              {bio && (
                <div className="bg-muted/50 p-3 rounded-lg text-xs italic text-muted-foreground border">
                  "{bio}"
                </div>
              )}
              {profile?.is_suspended && (
                <div className="p-3 bg-destructive/10 text-destructive rounded-lg flex items-center gap-2 text-xs">
                  <ShieldAlert className="h-4 w-4" /> Account currently suspended
                </div>
              )}
            </CardContent>
          </Card>

          {/* Edit Form */}
          <Card className="md:col-span-2 border-2">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <User className="h-5 w-5 text-primary" /> Edit Profile Settings
              </CardTitle>
              <CardDescription>
                Update your public profile details for community members
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="full-name">Full Name</Label>
                  <Input
                    id="full-name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="avatar-url">Avatar Image URL</Label>
                  <Input
                    id="avatar-url"
                    type="url"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                  />
                  <p className="text-xs text-muted-foreground">Provide a link to your profile photo</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">About / Bio</Label>
                  <Textarea
                    id="bio"
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Share a short bio about yourself and what items you love to share..."
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Location / Address</Label>
                    <Input
                      id="address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="City, State or Neighborhood"
                    />
                  </div>
                </div>

                <CardFooter className="px-0 pt-4 flex justify-end">
                  <Button type="submit" className="gap-2" disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Saving Changes...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" /> Save Profile
                      </>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Profile;
