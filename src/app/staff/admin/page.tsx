'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Layout from '@/components/Layout';
import { useAuthStore } from '@/store/authStore';
import { mockStaff } from '@/lib/mock-data';
import { Staff, TreatmentItem } from '@/types';
import { parseCSV, convertCSVToTreatmentItems, downloadCSVTemplate, exportTreatmentItemsToCSV } from '@/lib/csv-utils';

// モック治療項目データ
const mockTreatmentItems: TreatmentItem[] = [
  {
    id: '1',
    clinic_id: 'hachi-dental-onojo',
    internal_name: 'C処置',
    patient_name: '虫歯治療',
    category: '治療',
    description: '虫歯の除去と詰め物',
    order: 1,
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    clinic_id: 'hachi-dental-onojo',
    internal_name: 'SRP',
    patient_name: '歯石除去・歯面清掃',
    category: '予防',
    description: '歯石の除去と歯面のクリーニング',
    order: 2,
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export default function StaffAdminPage() {
  const router = useRouter();
  const { user, staff } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'treatments' | 'staff'>('treatments');
  
  // 治療項目管理の状態
  const [treatmentItems, setTreatmentItems] = useState<TreatmentItem[]>([]);
  const [showAddTreatment, setShowAddTreatment] = useState(false);
  const [newTreatment, setNewTreatment] = useState({
    internal_name: '',
    patient_name: '',
    category: '',
    description: ''
  });
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // スタッフ管理の状態
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [pendingStaff, setPendingStaff] = useState<Staff[]>([]);

  useEffect(() => {
    if (!user || user.role !== 'staff' || !staff || staff.role !== 'admin') {
      router.push('/staff/dashboard');
      return;
    }
    
    // モックデータを設定
    setTreatmentItems(mockTreatmentItems);
    setStaffList(mockStaff.filter(s => s.approved));
    setPendingStaff([
      {
        id: 'pending-1',
        name: '新人衛生士',
        email: 'newbie@hachi-dental.com',
        clinic_id: 'hachi-dental-onojo',
        role: 'hygienist',
        approved: false,
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      }
    ]);
  }, [user, staff, router]);

  const handleAddTreatment = () => {
    if (!newTreatment.internal_name || !newTreatment.patient_name) {
      alert('院内呼び方と患者様向け呼び方は必須です');
      return;
    }

    const treatment: TreatmentItem = {
      id: Date.now().toString(),
      clinic_id: 'hachi-dental-onojo',
      internal_name: newTreatment.internal_name,
      patient_name: newTreatment.patient_name,
      category: newTreatment.category,
      description: newTreatment.description,
      order: treatmentItems.length + 1,
      active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setTreatmentItems([...treatmentItems, treatment]);
    setNewTreatment({
      internal_name: '',
      patient_name: '',
      category: '',
      description: ''
    });
    setShowAddTreatment(false);
    alert('治療項目を追加しました');
  };

  const handleDeleteTreatment = (id: string) => {
    if (confirm('この治療項目を削除しますか？')) {
      setTreatmentItems(treatmentItems.filter(item => item.id !== id));
      alert('治療項目を削除しました');
    }
  };

  const handleToggleTreatmentActive = (id: string) => {
    setTreatmentItems(treatmentItems.map(item =>
      item.id === id ? { ...item, active: !item.active } : item
    ));
  };

  const handleCSVUpload = async () => {
    if (!csvFile) {
      alert('CSVファイルを選択してください');
      return;
    }

    setIsUploading(true);
    
    try {
      const text = await csvFile.text();
      const csvRows = parseCSV(text);
      const newItems = convertCSVToTreatmentItems(csvRows, 'hachi-dental-onojo', treatmentItems.length + 1);

      setTreatmentItems([...treatmentItems, ...newItems]);
      setCsvFile(null);
      alert(`${newItems.length}件の治療項目をインポートしました`);
    } catch (error) {
      console.error('CSV upload error:', error);
      alert(error instanceof Error ? error.message : 'CSVファイルの読み込みに失敗しました');
    } finally {
      setIsUploading(false);
    }
  };

  const handleApproveStaff = (staffId: string) => {
    const staffMember = pendingStaff.find(s => s.id === staffId);
    if (staffMember) {
      const approvedStaff = { ...staffMember, approved: true };
      setStaffList([...staffList, approvedStaff]);
      setPendingStaff(pendingStaff.filter(s => s.id !== staffId));
      alert(`${staffMember.name}さんを承認しました`);
    }
  };

  const handleRejectStaff = (staffId: string) => {
    const staffMember = pendingStaff.find(s => s.id === staffId);
    if (staffMember && confirm(`${staffMember.name}さんの登録を却下しますか？`)) {
      setPendingStaff(pendingStaff.filter(s => s.id !== staffId));
      alert(`${staffMember.name}さんの登録を却下しました`);
    }
  };

  if (!user || !staff || staff.role !== 'admin') {
    return null;
  }

  return (
    <Layout 
      title="管理者設定"
      showBackButton={true}
      backUrl="/staff/dashboard"
      backLabel="ダッシュボードに戻る"
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">管理者設定</h1>
        </div>

        {/* タブナビゲーション */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('treatments')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'treatments'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              治療項目管理
            </button>
            <button
              onClick={() => setActiveTab('staff')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'staff'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              スタッフ承認
              {pendingStaff.length > 0 && (
                <span className="ml-2 bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  {pendingStaff.length}
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* 治療項目管理タブ */}
        {activeTab === 'treatments' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">治療項目一覧</h2>
              <div className="flex gap-2">
                <Button variant="outline" onClick={downloadCSVTemplate}>
                  CSVテンプレート
                </Button>
                <Button variant="outline" onClick={() => exportTreatmentItemsToCSV(treatmentItems)}>
                  CSVエクスポート
                </Button>
                <Button onClick={() => setShowAddTreatment(true)}>
                  新規追加
                </Button>
              </div>
            </div>

            {/* CSV アップロード */}
            <Card>
              <CardHeader>
                <CardTitle>CSVファイルからインポート</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  <Button
                    onClick={handleCSVUpload}
                    disabled={!csvFile || isUploading}
                    isLoading={isUploading}
                  >
                    アップロード
                  </Button>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  必須列: internal_name, patient_name / オプション列: category, description
                </p>
              </CardContent>
            </Card>

            {/* 治療項目追加フォーム */}
            {showAddTreatment && (
              <Card>
                <CardHeader>
                  <CardTitle>新規治療項目追加</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        院内呼び方 *
                      </label>
                      <Input
                        type="text"
                        value={newTreatment.internal_name}
                        onChange={(e) => setNewTreatment({...newTreatment, internal_name: e.target.value})}
                        placeholder="C処置"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        患者様向け呼び方 *
                      </label>
                      <Input
                        type="text"
                        value={newTreatment.patient_name}
                        onChange={(e) => setNewTreatment({...newTreatment, patient_name: e.target.value})}
                        placeholder="虫歯治療"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        カテゴリ
                      </label>
                      <Input
                        type="text"
                        value={newTreatment.category}
                        onChange={(e) => setNewTreatment({...newTreatment, category: e.target.value})}
                        placeholder="治療"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        詳細説明
                      </label>
                      <Input
                        type="text"
                        value={newTreatment.description}
                        onChange={(e) => setNewTreatment({...newTreatment, description: e.target.value})}
                        placeholder="虫歯の除去と詰め物"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button onClick={handleAddTreatment}>
                      追加
                    </Button>
                    <Button variant="outline" onClick={() => setShowAddTreatment(false)}>
                      キャンセル
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 治療項目一覧 */}
            <div className="grid gap-4">
              {treatmentItems.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {item.internal_name}
                          </h3>
                          <span className="text-sm text-gray-500">
                            → {item.patient_name}
                          </span>
                          {item.category && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {item.category}
                            </span>
                          )}
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            item.active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {item.active ? '有効' : '無効'}
                          </span>
                        </div>
                        {item.description && (
                          <p className="text-sm text-gray-600">{item.description}</p>
                        )}
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleTreatmentActive(item.id)}
                        >
                          {item.active ? '無効化' : '有効化'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteTreatment(item.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          削除
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* スタッフ承認タブ */}
        {activeTab === 'staff' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">スタッフ管理</h2>

            {/* 承認待ちスタッフ */}
            <Card>
              <CardHeader>
                <CardTitle>
                  承認待ちスタッフ
                  {pendingStaff.length > 0 && (
                    <span className="ml-2 bg-red-100 text-red-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                      {pendingStaff.length}件
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pendingStaff.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    承認待ちのスタッフはいません
                  </p>
                ) : (
                  <div className="space-y-4">
                    {pendingStaff.map((staffMember) => (
                      <div key={staffMember.id} className="flex justify-between items-center p-4 border rounded-lg">
                        <div>
                          <h3 className="font-medium">{staffMember.name}</h3>
                          <p className="text-sm text-gray-600">{staffMember.email}</p>
                          <p className="text-sm text-gray-500">
                            役割: {staffMember.role === 'admin' ? '管理者' : '歯科衛生士'}
                          </p>
                          <p className="text-sm text-gray-500">
                            登録日: {new Date(staffMember.created_at).toLocaleDateString('ja-JP')}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleApproveStaff(staffMember.id)}
                          >
                            承認
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRejectStaff(staffMember.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            却下
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 承認済みスタッフ */}
            <Card>
              <CardHeader>
                <CardTitle>承認済みスタッフ一覧</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {staffList.map((staffMember) => (
                    <div key={staffMember.id} className="flex justify-between items-center p-4 border rounded-lg bg-green-50">
                      <div>
                        <h3 className="font-medium">{staffMember.name}</h3>
                        <p className="text-sm text-gray-600">{staffMember.email}</p>
                        <p className="text-sm text-gray-500">
                          役割: {staffMember.role === 'admin' ? '管理者' : '歯科衛生士'}
                        </p>
                        <p className="text-sm text-gray-500">
                          登録日: {new Date(staffMember.created_at).toLocaleDateString('ja-JP')}
                        </p>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        承認済み
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
} 