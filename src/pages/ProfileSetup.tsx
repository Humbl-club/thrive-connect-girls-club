
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { User, MapPin, Calendar, Instagram } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// Create a schema for form validation
const formSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  instagramHandle: z.string().min(2, "Instagram handle is required"),
  bio: z.string().optional(),
  location: z.string().optional(),
  birthDate: z.string().optional()
});

type FormValues = z.infer<typeof formSchema>;

// Popular cities for autocomplete
const popularCities = [
  "New York", "Los Angeles", "Chicago", "Houston", "Phoenix",
  "Philadelphia", "San Antonio", "San Diego", "Dallas", "San Jose",
  "Austin", "Jacksonville", "San Francisco", "London", "Paris",
  "Tokyo", "Berlin", "Madrid", "Rome", "Sydney", "Toronto"
];

export default function ProfileSetup() {
  const [loading, setLoading] = useState(false);
  const [filteredCities, setFilteredCities] = useState<string[]>([]);
  const [showCities, setShowCities] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      username: "",
      instagramHandle: "",
      bio: "",
      location: "",
      birthDate: ""
    }
  });

  const handleLocationChange = (value: string) => {
    form.setValue("location", value);
    if (value.trim() === "") {
      setFilteredCities([]);
      setShowCities(false);
      return;
    }

    const filtered = popularCities.filter(city => 
      city.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredCities(filtered);
    setShowCities(filtered.length > 0);
  };

  const selectCity = (city: string) => {
    form.setValue("location", city);
    setShowCities(false);
  };

  const handleSubmit = async (values: FormValues) => {
    if (!user) return;

    try {
      setLoading(true);

      // Update the profiles table
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: values.fullName,
          username: values.username,
          bio: values.bio || null,
          location: values.location || null,
          birth_date: values.birthDate || null,
          instagram_handle: values.instagramHandle
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Profile created!",
        description: "Welcome to the fitness app!",
      });

      // Redirect to dashboard after successful profile setup
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An error occurred while creating your profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 bg-background">
      <div className="w-full max-w-md space-y-8 p-8 bg-white rounded-xl shadow-lg dark:bg-gray-800">
        <div className="text-center">
          <User className="mx-auto h-12 w-12 text-primary" />
          <h1 className="text-3xl font-bold mt-4">Complete Your Profile</h1>
          <p className="text-muted-foreground mt-2">
            Let's set up your fitness profile to get started
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Tell us a bit about yourself</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel>Full Name *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="John Doe"
                          {...field}
                          required
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel>Username *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="johndoe"
                          {...field}
                          required
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="instagramHandle"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel>Instagram Handle *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Instagram className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="@johndoe"
                            className="pl-10"
                            {...field}
                            required
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel>Bio (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell us about your fitness goals..."
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel>City (Optional)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="New York, NY"
                            className="pl-10"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              handleLocationChange(e.target.value);
                            }}
                            onFocus={() => {
                              if (field.value && filteredCities.length > 0) {
                                setShowCities(true);
                              }
                            }}
                          />
                          {showCities && (
                            <ul className="absolute z-10 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md mt-1 max-h-48 overflow-y-auto">
                              {filteredCities.map((city) => (
                                <li 
                                  key={city}
                                  className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                                  onClick={() => selectCity(city)}
                                >
                                  {city}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="birthDate"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel>Birth Date (Optional)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="date"
                            className="pl-10"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Creating Profile..." : "Complete Setup"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
