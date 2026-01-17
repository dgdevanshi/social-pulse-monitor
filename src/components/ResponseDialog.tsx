import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Send, Save, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ResponseDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const responseTemplates = [
  {
    id: 'acknowledge',
    label: 'Acknowledge Issue',
    text: "Thank you for bringing this to our attention. We're looking into this matter and will get back to you shortly.",
  },
  {
    id: 'apologize',
    label: 'Apologize',
    text: "We sincerely apologize for the inconvenience you've experienced. Your feedback is important to us, and we're taking immediate steps to address this issue.",
  },
  {
    id: 'resolve',
    label: 'Resolution Update',
    text: "We've identified the issue and our team is working on a fix. We expect to have this resolved within [timeframe]. Thank you for your patience.",
  },
  {
    id: 'followup',
    label: 'Follow-up',
    text: "We wanted to follow up on your recent feedback. Has the issue been resolved to your satisfaction? Please let us know if there's anything else we can help with.",
  },
];

const platforms = [
  { value: 'twitter', label: 'Twitter / X' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'reddit', label: 'Reddit' },
];

export function ResponseDialog({ isOpen, onClose }: ResponseDialogProps) {
  const [response, setResponse] = useState('');
  const [platform, setPlatform] = useState('twitter');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const handleTemplateClick = (template: typeof responseTemplates[0]) => {
    setResponse(template.text);
    setSelectedTemplate(template.id);
  };

  const handleSend = () => {
    // In a real app, this would send the response via API
    console.log('Sending response:', { platform, response });
    onClose();
    setResponse('');
    setSelectedTemplate(null);
  };

  const handleSaveDraft = () => {
    // In a real app, this would save to drafts
    console.log('Saving draft:', { platform, response });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Create Response
          </DialogTitle>
          <DialogDescription>
            Draft a response to address negative sentiment. Use templates or write your own.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Platform Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Platform</label>
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger className="bg-background border-border">
                <SelectValue placeholder="Select platform" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {platforms.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Template Suggestions */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Quick Templates</label>
            <div className="flex flex-wrap gap-2">
              {responseTemplates.map((template) => (
                <Button
                  key={template.id}
                  variant="outline"
                  size="sm"
                  onClick={() => handleTemplateClick(template)}
                  className={cn(
                    'text-xs border-border',
                    selectedTemplate === template.id && 'bg-primary/10 border-primary text-primary'
                  )}
                >
                  {template.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Response Text Area */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Your Response</label>
            <Textarea
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              placeholder="Type your response here..."
              className="min-h-[150px] bg-background border-border resize-none"
            />
            <p className="text-xs text-muted-foreground text-right">
              {response.length} characters
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={handleSaveDraft}
              disabled={!response.trim()}
              className="border-border"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Draft
            </Button>
            <Button
              onClick={handleSend}
              disabled={!response.trim()}
              className="bg-primary hover:bg-primary/90"
            >
              <Send className="w-4 h-4 mr-2" />
              Send Response
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
