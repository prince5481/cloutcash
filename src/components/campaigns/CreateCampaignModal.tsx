import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { z } from "zod";

const campaignSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(100, "Title must be less than 100 characters"),
  budget: z.string().refine(val => !isNaN(Number(val)) && Number(val) > 0, "Budget must be a positive number"),
  deliverables: z.string().trim().min(10, "Deliverables must be at least 10 characters").max(1000, "Deliverables must be less than 1000 characters"),
  startDate: z.date({ required_error: "Start date is required" }),
  endDate: z.date({ required_error: "End date is required" }),
}).refine(data => data.endDate > data.startDate, {
  message: "End date must be after start date",
  path: ["endDate"],
});

interface CreateCampaignModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  brandProfileId: string;
  creatorProfileId?: string;
  onSuccess?: () => void;
}

export function CreateCampaignModal({ 
  open, 
  onOpenChange, 
  brandProfileId,
  creatorProfileId,
  onSuccess 
}: CreateCampaignModalProps) {
  const [title, setTitle] = useState("");
  const [budget, setBudget] = useState("");
  const [deliverables, setDeliverables] = useState("");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate
    const validation = campaignSchema.safeParse({
      title,
      budget,
      deliverables,
      startDate,
      endDate,
    });

    if (!validation.success) {
      const newErrors: Record<string, string> = {};
      validation.error.errors.forEach(err => {
        if (err.path[0]) {
          newErrors[err.path[0].toString()] = err.message;
        }
      });
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const { error } = await supabase.from("campaigns").insert({
        title,
        budget: parseInt(budget),
        deliverables,
        start_date: startDate?.toISOString(),
        end_date: endDate?.toISOString(),
        brand_id: brandProfileId,
        creator_id: creatorProfileId || null,
        status: "proposed",
      });

      if (error) throw error;

      toast({
        title: "Campaign created!",
        description: "Your campaign has been successfully created.",
      });

      // Reset form
      setTitle("");
      setBudget("");
      setDeliverables("");
      setStartDate(undefined);
      setEndDate(undefined);
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Error creating campaign:", error);
      toast({
        title: "Error",
        description: "Failed to create campaign. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Campaign</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Campaign Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Summer Product Launch"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={errors.title ? "border-destructive" : ""}
            />
            {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="budget">Budget (₹) *</Label>
            <Input
              id="budget"
              type="number"
              placeholder="e.g., 50000"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className={errors.budget ? "border-destructive" : ""}
            />
            {errors.budget && <p className="text-sm text-destructive">{errors.budget}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="deliverables">Deliverables *</Label>
            <Textarea
              id="deliverables"
              placeholder="Describe what you expect from this campaign (e.g., 3 Instagram posts, 5 stories, 1 reel)"
              value={deliverables}
              onChange={(e) => setDeliverables(e.target.value)}
              rows={4}
              className={errors.deliverables ? "border-destructive" : ""}
            />
            {errors.deliverables && <p className="text-sm text-destructive">{errors.deliverables}</p>}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground",
                      errors.startDate && "border-destructive"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
              {errors.startDate && <p className="text-sm text-destructive">{errors.startDate}</p>}
            </div>

            <div className="space-y-2">
              <Label>End Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground",
                      errors.endDate && "border-destructive"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
              {errors.endDate && <p className="text-sm text-destructive">{errors.endDate}</p>}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Campaign
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
