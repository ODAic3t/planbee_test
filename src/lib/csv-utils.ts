import { TreatmentItem, TreatmentCSVRow } from '@/types';

// CSVファイルを読み込んでパースする
export const parseCSV = (text: string): TreatmentCSVRow[] => {
  const lines = text.split('\n').filter(line => line.trim());
  if (lines.length < 2) {
    throw new Error('CSVファイルが空です');
  }

  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const rows: TreatmentCSVRow[] = [];

  // 必須ヘッダーの検証
  const requiredHeaders = ['internal_name', 'patient_name'];
  const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
  
  if (missingHeaders.length > 0) {
    throw new Error(`必須列が不足しています: ${missingHeaders.join(', ')}`);
  }

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
    const row: any = {};
    
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });

    if (row.internal_name && row.patient_name) {
      rows.push({
        internal_name: row.internal_name,
        patient_name: row.patient_name,
        category: row.category || '',
        description: row.description || ''
      });
    }
  }

  return rows;
};

// CSVデータを治療項目に変換
export const convertCSVToTreatmentItems = (
  csvRows: TreatmentCSVRow[], 
  clinicId: string, 
  startOrder: number = 1
): TreatmentItem[] => {
  return csvRows.map((row, index) => ({
    id: `csv-${Date.now()}-${index}`,
    clinic_id: clinicId,
    internal_name: row.internal_name,
    patient_name: row.patient_name,
    category: row.category,
    description: row.description,
    order: startOrder + index,
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }));
};

// CSVテンプレートをダウンロード
export const downloadCSVTemplate = () => {
  const csvContent = [
    'internal_name,patient_name,category,description',
    'C処置,虫歯治療,治療,虫歯の除去と詰め物',
    'SRP,歯石除去・歯面清掃,予防,歯石の除去と歯面のクリーニング',
    'Ext,抜歯,外科,歯の抜去',
    'Imp,インプラント,外科,人工歯根の埋入',
    'Endo,根管治療,治療,歯の神経の治療'
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', 'treatment_template.csv');
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// 治療項目をCSVとしてエクスポート
export const exportTreatmentItemsToCSV = (items: TreatmentItem[], filename: string = 'treatments.csv') => {
  const headers = ['internal_name', 'patient_name', 'category', 'description'];
  const csvContent = [
    headers.join(','),
    ...items.map(item => [
      item.internal_name,
      item.patient_name,
      item.category || '',
      item.description || ''
    ].map(field => `"${field}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}; 