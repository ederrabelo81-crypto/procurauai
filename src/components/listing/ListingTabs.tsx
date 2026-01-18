import { ReactNode, useState } from 'react';
import { cn } from '@/lib/utils';

export interface TabItem {
  id: string;
  label: string;
  icon?: ReactNode;
  content: ReactNode;
  /** Se true, a aba só aparece se content não for null/undefined */
  hideIfEmpty?: boolean;
}

interface ListingTabsProps {
  tabs: TabItem[];
  defaultTab?: string;
  className?: string;
}

export function ListingTabs({ tabs, defaultTab, className }: ListingTabsProps) {
  const visibleTabs = tabs.filter((tab) => !tab.hideIfEmpty || tab.content);
  const [activeTab, setActiveTab] = useState(defaultTab || visibleTabs[0]?.id);

  const activeContent = visibleTabs.find((t) => t.id === activeTab)?.content;

  if (visibleTabs.length === 0) return null;

  return (
    <div className={cn('', className)}>
      {/* Tab headers - scroll horizontal */}
      <div className="sticky top-[60px] z-30 bg-background border-b border-border">
        <div className="flex overflow-x-auto scrollbar-hide -mx-4 px-4">
          {visibleTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors touch-target',
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="py-4">{activeContent}</div>
    </div>
  );
}
