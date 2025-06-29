'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Layout from '@/components/Layout';
import { useAuthStore } from '@/store/authStore';
import { useChatStore } from '@/store/chatStore';
import { ChatMessage } from '@/types';
import { formatDateTime } from '@/lib/utils';

export default function PatientChatPage() {
  const router = useRouter();
  const { user, patient } = useAuthStore();
  const { messages, addMessage, setLoading, isLoading, error } = useChatStore();
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user || user.role !== 'patient' || !patient) {
      router.push('/patient/login');
    }
  }, [user, patient, router]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !patient) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      patient_id: patient.id,
      role: 'user',
      content: inputMessage.trim(),
      created_at: new Date().toISOString(),
    };

    addMessage(userMessage);
    setInputMessage('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage.trim(),
          patientId: patient.id,
        }),
      });

      if (!response.ok) {
        throw new Error('チャット送信に失敗しました');
      }

      const data = await response.json();

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        patient_id: patient.id,
        role: 'assistant',
        content: data.response,
        created_at: new Date().toISOString(),
      };

      addMessage(assistantMessage);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        patient_id: patient.id,
        role: 'assistant',
        content: '申し訳ございません。現在サービスに問題が発生しています。しばらく後にお試しください。',
        created_at: new Date().toISOString(),
      };
      addMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!user || !patient) {
    return null;
  }

  return (
    <Layout 
      title="AI歯科医師相談"
      showBackButton={true}
      backUrl="/patient/dashboard"
      backLabel="ダッシュボードに戻る"
    >
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <svg className="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              AI歯科医師に相談
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* チャット履歴表示エリア */}
              <div className="h-96 overflow-y-auto border rounded-lg p-4 bg-gray-50">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                      <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <p>歯科に関するご質問をお気軽にどうぞ</p>
                      <p className="text-sm mt-2">例：「歯茎から血が出るのですが...」</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.role === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.role === 'user'
                              ? 'bg-blue-600 text-white'
                              : 'bg-white border'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p
                            className={`text-xs mt-1 ${
                              message.role === 'user'
                                ? 'text-blue-100'
                                : 'text-gray-500'
                            }`}
                          >
                            {formatDateTime(message.created_at)}
                          </p>
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="bg-white border rounded-lg px-4 py-2 max-w-xs">
                          <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            <span className="text-sm text-gray-500">
                              AI歯科医師が回答を準備中...
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* メッセージ入力エリア */}
              <div className="flex space-x-2">
                <div className="flex-1">
                  <Input
                    placeholder="歯科に関するご質問をどうぞ..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isLoading}
                  />
                </div>
                <Button
                  onClick={sendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  isLoading={isLoading}
                >
                  送信
                </Button>
              </div>
            </div>

            {/* 注意事項 */}
            <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
              <h4 className="font-semibold text-yellow-900 mb-2">重要な注意事項</h4>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• これは一般的な情報提供を目的としており、診断ではありません</li>
                <li>• 緊急時や痛みがひどい場合は、直接医院にお電話ください</li>
                <li>• 具体的な治療については、実際の診察で歯科医師にご相談ください</li>
                <li>• 会話内容は記録され、歯科衛生士が確認する場合があります</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
} 