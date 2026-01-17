import { useState } from 'react';
import { TrackedKeyword } from '@/types/social';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Hash } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KeywordManagerProps {
  keywords: TrackedKeyword[];
  onAdd: (keyword: string) => void;
  onRemove: (id: string) => void;
  onToggle: (id: string) => void;
  className?: string;
}

export function KeywordManager({
  keywords,
  onAdd,
  onRemove,
  onToggle,
  className,
}: KeywordManagerProps) {
  const [newKeyword, setNewKeyword] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = () => {
    if (newKeyword.trim()) {
      onAdd(newKeyword.trim());
      setNewKeyword('');
      setIsAdding(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAdd();
    } else if (e.key === 'Escape') {
      setIsAdding(false);
      setNewKeyword('');
    }
  };

  return (
    <div className={cn('rounded-xl border border-border bg-card', className)}>
      <div className="p-6 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Tracked Keywords</h3>
          <p className="text-sm text-muted-foreground">
            Monitor specific brands and topics
          </p>
        </div>
        {!isAdding && (
          <Button
            size="sm"
            onClick={() => setIsAdding(true)}
            className="gap-1"
          >
            <Plus className="w-4 h-4" />
            Add
          </Button>
        )}
      </div>
      <div className="p-4 space-y-2">
        <AnimatePresence mode="popLayout">
          {isAdding && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex gap-2 mb-4"
            >
              <Input
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter keyword or brand..."
                className="flex-1"
                autoFocus
              />
              <Button size="sm" onClick={handleAdd}>
                Add
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setIsAdding(false);
                  setNewKeyword('');
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </motion.div>
          )}
          {keywords.map((kw) => (
            <motion.div
              key={kw.id}
              layout
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className={cn(
                'flex items-center justify-between p-3 rounded-lg border transition-colors',
                kw.isActive
                  ? 'bg-muted/50 border-border'
                  : 'bg-transparent border-border/50 opacity-60'
              )}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Hash className="w-4 h-4 text-primary" />
                </div>
                <span className="font-medium">{kw.keyword}</span>
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  checked={kw.isActive}
                  onCheckedChange={() => onToggle(kw.id)}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => onRemove(kw.id)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
