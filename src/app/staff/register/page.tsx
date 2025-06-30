'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Layout from '@/components/Layout';
import { registerStaff } from '@/lib/auth';
import { StaffLoginForm } from '@/types';
import { validateEmail } from '@/lib/utils';
import Link from 'next/link';

interface StaffRegisterForm extends StaffLoginForm {
  name: string;
  confirmPassword: string;
}

export default function StaffRegisterPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setError: setFormError,
  } = useForm<StaffRegisterForm>();

  const watchPassword = watch('password');

  const onSubmit = async (data: StaffRegisterForm) => {
    if (!validateEmail(data.email)) {
      setFormError('email', {
        type: 'manual',
        message: '有効なメールアドレスを入力してください'
      });
      return;
    }

    if (data.password !== data.confirmPassword) {
      setFormError('confirmPassword', {
        type: 'manual',
        message: 'パスワードが一致しません'
      });
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // 固定のクリニックID（大野城はち歯科）
      const clinicId = 'hachi-dental-onojo';
      
      const result = await registerStaff(data.name, data.email, data.password, clinicId);
      
      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.error || '登録に失敗しました');
      }
    } catch {
      setError('登録に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <Layout 
        title="スタッフ登録完了" 
        showHeader={false}
        showBackButton={true}
        backUrl="/staff/login"
        backLabel="ログインに戻る"
      >
        <div className="min-h-screen flex items-center justify-center">
          <div className="max-w-md w-full">
            <Card>
              <CardHeader>
                <CardTitle className="text-center text-green-600">
                  登録完了
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-green-800">
                      スタッフアカウントの登録が完了しました。<br />
                      管理者の承認をお待ちください。
                    </p>
                  </div>
                  
                  <Link href="/staff/login">
                    <Button className="w-full">
                      ログインページへ
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout 
      title="スタッフ登録" 
      showHeader={false}
      showBackButton={true}
      backUrl="/staff/login"
      backLabel="ログインに戻る"
    >
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">スタッフ登録</CardTitle>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="mb-4 p-4 bg-red-50 rounded-lg">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                  label="氏名"
                  type="text"
                  placeholder="山田太郎"
                  {...register('name', {
                    required: '氏名を入力してください',
                    minLength: {
                      value: 2,
                      message: '氏名は2文字以上で入力してください'
                    }
                  })}
                  error={errors.name?.message}
                />

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

                <Input
                  label="パスワード確認"
                  type="password"
                  placeholder="パスワード確認"
                  {...register('confirmPassword', {
                    required: 'パスワード確認を入力してください',
                    validate: (value) =>
                      value === watchPassword || 'パスワードが一致しません'
                  })}
                  error={errors.confirmPassword?.message}
                />

                <Button
                  type="submit"
                  className="w-full"
                  isLoading={isSubmitting}
                  disabled={isSubmitting}
                >
                  登録する
                </Button>
              </form>

              <div className="mt-6 text-center space-y-2">
                <Link href="/staff/login" className="text-blue-600 hover:text-blue-800 text-sm block">
                  既にアカウントをお持ちですか？ログインはこちら
                </Link>
                <Link href="/" className="text-gray-600 hover:text-gray-800 text-sm block">
                  ← トップページに戻る
                </Link>
              </div>

              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>登録について：</strong><br />
                  • 登録後、管理者による承認が必要です<br />
                  • 承認完了後にログインが可能になります<br />
                  • 大野城はち歯科のスタッフ専用です
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
} 