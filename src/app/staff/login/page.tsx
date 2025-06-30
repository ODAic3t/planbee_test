'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Layout from '@/components/Layout';
import { loginStaff, loginStaffWithGoogle } from '@/lib/auth';
import { useAuthStore } from '@/store/authStore';
import { StaffLoginForm } from '@/types';
import { validateEmail } from '@/lib/utils';
import Link from 'next/link';

export default function StaffLoginPage() {
  const router = useRouter();
  const { setUser, setStaff, setLoading, setError } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError: setFormError,
  } = useForm<StaffLoginForm>();

  const onSubmit = async (data: StaffLoginForm) => {
    if (!validateEmail(data.email)) {
      setFormError('email', {
        type: 'manual',
        message: '有効なメールアドレスを入力してください'
      });
      return;
    }

    setIsSubmitting(true);
    setLoading(true);
    setError(null);

    try {
      const result = await loginStaff(data.email, data.password);
      
      if (result.success && result.user && result.staff) {
        setUser(result.user);
        setStaff(result.staff);
        router.push('/staff/dashboard');
      } else {
        setError(result.error || 'ログインに失敗しました');
      }
    } catch {
      setError('ログインに失敗しました');
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setError(null);

    try {
      const result = await loginStaffWithGoogle();
      
      if (!result.success) {
        setError(result.error || 'Google認証に失敗しました');
      }
      // 成功時はコールバックページで処理される
    } catch {
      setError('Google認証に失敗しました');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <Layout 
      title="スタッフログイン" 
      showHeader={false}
      showBackButton={true}
      backUrl="/"
      backLabel="トップページに戻る"
    >
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full">
          {/* 患者様向けの案内 */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center mb-2">
              <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="font-semibold text-blue-900">患者様へ</h3>
            </div>
            <p className="text-sm text-blue-800 mb-3">
              こちらはスタッフ専用のログインページです。<br />
              患者様は下記のボタンからログインしてください。
            </p>
            <Link href="/">
              <Button variant="outline" size="sm" className="w-full">
                患者様ログインページへ
              </Button>
            </Link>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-center">スタッフログイン</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                  label="メールアドレス"
                  type="email"
                  placeholder="staff@example.com"
                  {...register('email', {
                    required: 'メールアドレスを入力してください',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: '有効なメールアドレスを入力してください'
                    }
                  })}
                  error={errors.email?.message}
                />

                <Input
                  label="パスワード"
                  type="password"
                  placeholder="パスワード"
                  {...register('password', {
                    required: 'パスワードを入力してください',
                    minLength: {
                      value: 6,
                      message: 'パスワードは6文字以上で入力してください'
                    }
                  })}
                  error={errors.password?.message}
                />

                <Button
                  type="submit"
                  className="w-full"
                  isLoading={isSubmitting}
                  disabled={isSubmitting}
                >
                  ログイン
                </Button>
              </form>

              <div className="mt-4">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">または</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full mt-4 flex items-center justify-center"
                  onClick={handleGoogleLogin}
                  isLoading={isGoogleLoading}
                  disabled={isGoogleLoading || isSubmitting}
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Googleでログイン
                </Button>
              </div>

              <div className="mt-6 text-center space-y-2">
                <Link href="/staff/register" className="text-blue-600 hover:text-blue-800 text-sm block">
                  スタッフ登録はこちら
                </Link>
                <Link href="/" className="text-gray-600 hover:text-gray-800 text-sm block">
                  ← トップページに戻る
                </Link>
              </div>

              <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>注意：</strong><br />
                  スタッフアカウントは管理者の承認が必要です。<br />
                  登録後、管理者に承認を依頼してください。
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
} 