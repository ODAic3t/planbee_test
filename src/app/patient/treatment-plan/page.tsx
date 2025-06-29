'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Layout from '@/components/Layout';
import { useAuthStore } from '@/store/authStore';
import { TreatmentPlan, TreatmentItem, TreatmentPlanItem } from '@/types';
import { formatDate, formatDateTime } from '@/lib/utils';
import { mockTreatmentPlans, mockTreatmentItems } from '@/lib/mock-data';

export default function PatientTreatmentPlanPage() {
  const router = useRouter();
  const { user, patient } = useAuthStore();
  const [treatmentPlan, setTreatmentPlan] = useState<TreatmentPlan | null>(null);
  const [treatmentItems, setTreatmentItems] = useState<TreatmentPlanItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'patient' || !patient) {
      router.push('/patient/login');
      return;
    }

    // 開発環境ではモックデータを使用
    const loadTreatmentPlan = () => {
      setLoading(true);
      
      // 患者の治療計画を取得
      const plan = mockTreatmentPlans.find(p => p.patient_id === patient.id);
      
      if (plan) {
        setTreatmentPlan(plan);
        
        // 治療項目の詳細を取得
        const planItems = plan.treatment_items.map(planItem => {
          const item = mockTreatmentItems.find(i => i.id === planItem.treatment_item_id);
          return {
            ...planItem,
            treatment_item: item
          };
        });
        
        setTreatmentItems(planItems);
      }
      
      setLoading(false);
    };

    loadTreatmentPlan();
  }, [user, patient, router]);

  if (!user || !patient) {
    return null;
  }

  if (loading) {
    return (
      <Layout 
        title="診療計画"
        showBackButton={true}
        backUrl="/patient/dashboard"
        backLabel="ダッシュボードに戻る"
      >
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (!treatmentPlan) {
    return (
      <Layout 
        title="診療計画"
        showBackButton={true}
        backUrl="/patient/dashboard"
        backLabel="ダッシュボードに戻る"
      >
        <div className="text-center py-12">
          <div className="bg-gray-50 rounded-lg p-8">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              診療計画がまだ作成されていません
            </h3>
            <p className="text-gray-600 mb-4">
              歯科衛生士が診療計画を作成するまでお待ちください。
            </p>
            <Button onClick={() => router.push('/patient/dashboard')}>
              ダッシュボードに戻る
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const completedItems = treatmentItems.filter(item => item.completed);
  const pendingItems = treatmentItems.filter(item => !item.completed);
  const progressPercentage = treatmentItems.length > 0 
    ? Math.round((completedItems.length / treatmentItems.length) * 100) 
    : 0;

  // 今後の予定を日付順にソート
  const upcomingItems = pendingItems
    .filter(item => item.scheduled_date)
    .sort((a, b) => new Date(a.scheduled_date!).getTime() - new Date(b.scheduled_date!).getTime());
  
  // 完了した項目を日付順にソート
  const completedItemsSorted = completedItems
    .sort((a, b) => {
      const dateA = a.completed_date || a.scheduled_date;
      const dateB = b.completed_date || b.scheduled_date;
      if (!dateA || !dateB) return 0;
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });

  return (
    <Layout 
      title="診療計画"
      showBackButton={true}
      backUrl="/patient/dashboard"
      backLabel="ダッシュボードに戻る"
    >
      <div className="space-y-6">
        {/* 治療計画概要 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              {patient.name}さんの診療計画
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">基本情報</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">作成日:</span>
                    <span>{formatDate(treatmentPlan.created_at)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">最終更新:</span>
                    <span>{formatDate(treatmentPlan.updated_at)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">担当歯科衛生士:</span>
                    <span>{treatmentPlan.staff_name || '未設定'}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">治療進捗</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>進捗率</span>
                    <span className="font-semibold">{progressPercentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>完了: {completedItems.length}項目</span>
                    <span>残り: {pendingItems.length}項目</span>
                  </div>
                </div>
              </div>
            </div>

            {treatmentPlan.notes && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">治療方針・備考</h4>
                <p className="text-blue-800 text-sm whitespace-pre-wrap">
                  {treatmentPlan.notes}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 今後の予定 */}
        {upcomingItems.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                今後の予定
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingItems.map((item, index) => (
                  <div 
                    key={item.id}
                    className="border rounded-lg p-4 bg-blue-50 border-blue-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold mr-3 bg-blue-600 text-white">
                            {index + 1}
                          </div>
                          <h4 className="font-semibold text-gray-900">
                            {item.treatment_item?.patient_name || '治療項目'}
                          </h4>
                        </div>
                        
                        {item.treatment_item?.description && (
                          <p className="text-gray-600 text-sm mb-2 ml-9">
                            {item.treatment_item.description}
                          </p>
                        )}
                        
                        <div className="ml-9 space-y-1 text-sm">
                          {item.tooth_number && (
                            <div className="flex items-center text-gray-600">
                              <span className="font-medium mr-2">対象歯:</span>
                              <span>{item.tooth_number}番</span>
                            </div>
                          )}
                          
                          {item.estimated_sessions && (
                            <div className="flex items-center text-gray-600">
                              <span className="font-medium mr-2">予定回数:</span>
                              <span>{item.estimated_sessions}回</span>
                            </div>
                          )}
                          
                          {item.scheduled_date && (
                            <div className="flex items-center text-blue-700 font-medium">
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span>予定日: {formatDateTime(item.scheduled_date)}</span>
                            </div>
                          )}
                          
                          {item.notes && (
                            <div className="text-gray-600">
                              <span className="font-medium">備考:</span>
                              <span className="ml-2">{item.notes}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="ml-4">
                        <div className="flex items-center text-blue-600">
                          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-sm font-medium">予定</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 完了した治療 */}
        {completedItemsSorted.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                完了した治療
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                                 {completedItemsSorted.map((item, index) => (
                   <div 
                     key={item.id}
                     className="border rounded-lg p-4 bg-green-50 border-green-200"
                   >
                     <div className="flex items-start justify-between">
                       <div className="flex-1">
                         <div className="flex items-center mb-2">
                           <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold mr-3 bg-green-600 text-white">
                             ✓
                           </div>
                           <h4 className="font-semibold text-gray-900">
                             {item.treatment_item?.patient_name || '治療項目'}
                           </h4>
                         </div>
                         
                         {item.treatment_item?.description && (
                           <p className="text-gray-600 text-sm mb-2 ml-9">
                             {item.treatment_item.description}
                           </p>
                         )}
                         
                         <div className="ml-9 space-y-1 text-sm">
                           {item.tooth_number && (
                             <div className="flex items-center text-gray-600">
                               <span className="font-medium mr-2">対象歯:</span>
                               <span>{item.tooth_number}番</span>
                             </div>
                           )}
                           
                           {item.estimated_sessions && (
                             <div className="flex items-center text-gray-600">
                               <span className="font-medium mr-2">実施回数:</span>
                               <span>{item.estimated_sessions}回</span>
                             </div>
                           )}
                           
                           {(item.completed_date || item.scheduled_date) && (
                             <div className="flex items-center text-green-700 font-medium">
                               <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                               </svg>
                               <span>
                                 実施日: {formatDateTime(item.completed_date || item.scheduled_date!)}
                               </span>
                             </div>
                           )}
                           
                           {item.notes && (
                             <div className="text-gray-600">
                               <span className="font-medium">備考:</span>
                               <span className="ml-2">{item.notes}</span>
                             </div>
                           )}
                         </div>
                       </div>
                       
                       <div className="ml-4">
                         <div className="flex items-center text-green-600">
                           <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                             <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                           </svg>
                           <span className="text-sm font-medium">完了</span>
                         </div>
                       </div>
                     </div>
                   </div>
                 ))}
               </div>
             </CardContent>
           </Card>
         )}

        {/* 予定がない場合のメッセージ */}
        {upcomingItems.length === 0 && completedItemsSorted.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                治療項目がまだ設定されていません
              </h3>
              <p className="text-gray-600">
                歯科衛生士が治療項目を追加するまでお待ちください。
              </p>
            </CardContent>
          </Card>
        )}

        {/* 注意事項 */}
        <div className="bg-yellow-50 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-900 mb-2">重要な注意事項</h3>
          <ul className="text-sm text-yellow-800 space-y-1">
            <li>• 治療計画は診察の結果により変更される場合があります</li>
            <li>• 治療に関するご質問は、AI歯科医師相談またはスタッフにお尋ねください</li>
            <li>• 予約の変更やキャンセルは直接医院にお電話ください</li>
            <li>• 治療中に痛みや不快感がある場合は遠慮なくお申し出ください</li>
          </ul>
        </div>

        {/* アクションボタン */}
        <div className="flex space-x-4">
          <Button 
            onClick={() => router.push('/patient/chat')}
            variant="secondary"
            className="flex-1"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            治療について相談
          </Button>
          
          <Button 
            onClick={() => router.push('/patient/dashboard')}
            variant="outline"
            className="flex-1"
          >
            ダッシュボードに戻る
          </Button>
        </div>
      </div>
    </Layout>
  );
} 