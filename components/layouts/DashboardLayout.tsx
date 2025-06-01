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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800">
        <div className="flex h-16 items-center px-4 container justify-between">
          <div className="text-xl font-semibold">KingDAO.io</div>
          <Button
            variant="ghost"
            size="icon"
            className="relative hover:bg-gray-100 dark:hover:bg-gray-700"
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
            className={`flex-1 sm:flex-none ${
              activeTab === 'personal'
                ? 'bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white'
                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Personal
          </Button>
          <Button
            variant={activeTab === 'dao' ? 'default' : 'outline'}
            onClick={() => onTabChange('dao')}
            className={`flex-1 sm:flex-none ${
              activeTab === 'dao'
                ? 'bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white'
                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
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