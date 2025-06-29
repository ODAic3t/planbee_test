'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Layout from '@/components/Layout';

export default function HomePage() {
  return (
    <Layout title="PlanBee" showHeader={false}>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-md w-full space-y-8 p-6">
          <div className="text-center">
            <div className="mb-6">
              <div className="w-20 h-20 mx-auto mb-4 bg-blue-600 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                PlanBee
              </h1>
              <p className="text-lg text-gray-600 mb-2">
                歯科診療計画共有アプリ
              </p>
              <p className="text-sm text-gray-500">
                大野城はち歯科
              </p>
            </div>
          </div>

          <Card className="shadow-lg">
            <CardHeader className="bg-blue-600 text-white rounded-t-lg">
              <CardTitle className="text-center text-xl">
                患者様専用ログイン
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4 mb-6">
                <div className="text-center">
                  <h3 className="font-semibold text-gray-900 mb-2">ご利用方法</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    歯科衛生士からお伝えした<br />
                    <strong>患者番号</strong>と<strong>パスコード</strong>を<br />
                    入力してログインしてください
                  </p>
                </div>
                
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2 text-sm">このアプリでできること</h4>
                  <ul className="text-xs text-blue-800 space-y-1">
                    <li>• 診療計画の確認</li>
                    <li>• 治療スケジュールの確認</li>
                    <li>• AI歯科医師への相談</li>
                    <li>• 治療進捗の確認</li>
                  </ul>
                </div>
              </div>
              
              <Link href="/patient/login">
                <Button className="w-full" size="lg">
                  ログインする
                </Button>
              </Link>
            </CardContent>
          </Card>

          <div className="text-center">
            <p className="text-xs text-gray-500 mb-2">
              患者番号・パスコードをお忘れの方は<br />
              受付スタッフまでお声がけください
            </p>
            
            {/* スタッフ用の隠しリンク */}
            <div className="mt-8">
              <Link 
                href="/staff/login" 
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                スタッフの方はこちら
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
