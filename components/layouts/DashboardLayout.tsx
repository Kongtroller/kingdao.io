import { ReactNode } from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import { Button } from '../ui/button';

interface DashboardLayoutProps {
  children: ReactNode;
  activeTab: 'personal' | 'dao';
  onTabChange: (value: 'personal' | 'dao') => void;
}

export default function DashboardLayout({ 
  children, 
  activeTab, 
  onTabChange 
}: DashboardLayoutProps) {
  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="flex h-16 items-center px-4 container justify-between">
          <div className="text-xl font-semibold">KingDAO.io</div>
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </div>

      {/* Tab Buttons */}
      <div className="container py-4">
        <div className="flex gap-2">
          <Button
            variant={activeTab === 'personal' ? 'default' : 'outline'}
            onClick={() => onTabChange('personal')}
            className="flex-1 sm:flex-none"
          >
            Personal
          </Button>
          <Button
            variant={activeTab === 'dao' ? 'default' : 'outline'}
            onClick={() => onTabChange('dao')}
            className="flex-1 sm:flex-none"
          >
            DAO
          </Button>
        </div>
      </div>
      
      <main className="container py-6">
        {children}
      </main>
    </div>
  );
} 