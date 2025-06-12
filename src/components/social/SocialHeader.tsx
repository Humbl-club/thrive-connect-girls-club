
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SocialHeader() {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold text-text-primary">Social</h1>
      <Button variant="outline" size="icon" className="rounded-full border-brand-navy text-brand-navy hover:bg-brand-navy hover:text-white">
        <MessageSquare className="h-5 w-5" />
      </Button>
    </div>
  );
}
