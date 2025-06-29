'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { mockStaff } from '@/lib/mock-data';
import { AuthUser } from '@/types';

export default function AuthCallbackPage() {
  const router = useRouter();
  const { setUser, setStaff, setLoading, setError } = useAuthStore();

  useEffect(() => {
    const handleAuthCallback = async () => {
      setLoading(true);
      
      try {
        // 開発環境でのモック認証をチェック
        const urlParams = new URLSearchParams(window.location.search);
        const isMock = urlParams.get('mock') === 'true';
        
        if (isMock && process.env.NODE_ENV === 'development') {
          // モック認証：test@gmail.comでログイン
          const email = 'test@gmail.com';
          const staff = mockStaff.find(s => s.email === email);
          
          if (staff && staff.approved) {
            const authUser: AuthUser = {
              id: 'mock-google-user-id',
              email: email,
              role: 'staff',
              staff_id: staff.id
            };
            
            setUser(authUser);
            setStaff(staff);
            router.push('/staff/dashboard');
            return;
          } else {
            setError('承認されていないアカウントです');
            router.push('/staff/login');
            return;
          }
        }

        // URLのハッシュからトークンを取得
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          setError('認証に失敗しました');
          router.push('/staff/login');
          return;
        }

        if (data.session?.user) {
          const user = data.session.user;
          const email = user.email;

          if (!email) {
            setError('メールアドレスが取得できませんでした');
            router.push('/staff/login');
            return;
          }

          // 開発環境ではモックデータを使用
          if (process.env.NODE_ENV === 'development') {
            const staff = mockStaff.find(s => s.email === email);
            
            if (staff && staff.approved) {
              const authUser: AuthUser = {
                id: user.id,
                email: email,
                role: 'staff',
                staff_id: staff.id
              };
              
              setUser(authUser);
              setStaff(staff);
              router.push('/staff/dashboard');
            } else {
              setError('承認されていないアカウントです');
              router.push('/staff/login');
            }
          } else {
            // 本番環境ではSupabaseからスタッフ情報を取得
            const { data: staffData, error: staffError } = await supabase
              .from('staff')
              .select('*')
              .eq('email', email)
              .eq('approved', true)
              .single();

            if (staffError || !staffData) {
              setError('承認されていないアカウントです');
              router.push('/staff/login');
              return;
            }

            const authUser: AuthUser = {
              id: user.id,
              email: email,
              role: 'staff',
              staff_id: staffData.id
            };

            setUser(authUser);
            setStaff(staffData);
            router.push('/staff/dashboard');
          }
        } else {
          setError('認証に失敗しました');
          router.push('/staff/login');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        setError('認証処理中にエラーが発生しました');
        router.push('/staff/login');
      } finally {
        setLoading(false);
      }
    };

    handleAuthCallback();
  }, [router, setUser, setStaff, setLoading, setError]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">認証処理中...</p>
      </div>
    </div>
  );
} 