import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import Button from './ui/Button';
import { logout } from '@/lib/auth';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  showHeader?: boolean;
  showBackButton?: boolean;
  backUrl?: string;
  backLabel?: string;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  title = 'PlanBee', 
  showHeader = true,
  showBackButton = false,
  backUrl,
  backLabel = '戻る'
}) => {
  const router = useRouter();
  const { user, patient, staff, logout: logoutStore } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    logoutStore();
  };

  const handleBack = () => {
    if (backUrl) {
      router.push(backUrl);
    } else {
      router.back();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {showHeader && (
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                {showBackButton && (
                  <button
                    onClick={handleBack}
                    className="mr-4 flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    {backLabel}
                  </button>
                )}
                <h1 className="text-xl font-semibold text-gray-900">
                  {title}
                </h1>
              </div>
              
              <div className="flex items-center space-x-4">
                {user && (
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500">
                      {user.role === 'patient' && patient?.name}
                      {user.role === 'staff' && staff?.name}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleLogout}
                    >
                      ログアウト
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>
      )}
      
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
};

export default Layout; 