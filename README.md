# PlanBee - 歯科診療計画共有アプリ

PlanBeeは、歯科医院における診療計画共有と患者との継続的コミュニケーションを支援するWebアプリケーションです。

## 📋 概要

- **対象医院**: 大野城はち歯科（初期バージョン）
- **主要機能**: 診療計画共有、AI歯科医師相談、患者管理
- **技術スタック**: Next.js, TypeScript, Tailwind CSS, Supabase, OpenAI API
- **PWA対応**: モバイル端末でのアプリライクな操作が可能

## 🚀 主要機能

### 患者向け機能
- ✅ **簡単ログイン**: 患者番号（5桁）+ パスコード（6桁）
- ✅ **診療計画確認**: 次回の治療内容をわかりやすく表示
- ✅ **AI歯科医師相談**: ChatGPT搭載の専門相談機能
- ✅ **プロフィール管理**: 基本情報の確認・編集
- ✅ **相談履歴**: 過去のAI相談内容を保存・閲覧

### 歯科衛生士（スタッフ）向け機能
- ✅ **患者番号管理**: 新規患者の登録とパスコード確認
- ✅ **診療計画登録**: チェックボックス形式での治療計画作成
- ✅ **チャット要約**: 患者のAI相談履歴から自動要約生成
- ✅ **Google認証**: 安全なOAuth認証システム

## 🛠 技術仕様

### フロントエンド
- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Zustand** (状態管理)
- **React Hook Form** (フォーム管理)

### バックエンド
- **Supabase** (データベース・認証)
- **OpenAI API** (GPT-3.5-turbo)
- **Next.js API Routes**

### PWA対応
- **next-pwa**
- **マニフェストファイル**
- **サービスワーカー**

## 📦 セットアップ

### 前提条件
- Node.js 18.0.0 以上
- npm または yarn
- Supabaseアカウント
- OpenAI APIキー

### 1. プロジェクトのクローン
```bash
git clone <repository-url>
cd planbee
```

### 2. 依存関係のインストール
```bash
npm install
```

### 3. 環境変数の設定
`.env.local`ファイルを作成し、以下の設定を追加：

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_KEY=your_supabase_service_key_here

# OpenAI
OPENAI_API_KEY=your_openai_api_key_here

# Application
APP_URL=http://localhost:3000
```

### 4. データベースセットアップ
Supabaseのプロジェクトダッシュボードで、`database/schema.sql`を実行してテーブルを作成してください。

### 5. 開発サーバーの起動
```bash
npm run dev
```

アプリケーションは `http://localhost:3000` で起動します。

## 📱 使用方法

### 患者の方
1. トップページで「患者としてログイン」を選択
2. 歯科衛生士から伝えられた患者番号（5桁）とパスコード（6桁）を入力
3. ダッシュボードから各機能にアクセス

### スタッフの方
1. トップページで「スタッフとしてログイン」を選択
2. 初回の場合は「スタッフ登録」からアカウント作成
3. 管理者承認後、ログインが可能

## 🔒 セキュリティ機能

- **パスコード自動更新**: 60分ごとに6桁パスコードが自動生成
- **RLS（Row Level Security）**: Supabaseでのデータアクセス制御
- **Google OAuth**: スタッフ認証の二段階セキュリティ
- **HTTPS対応**: 本番環境での暗号化通信

## 📊 データベース設計

### 主要テーブル
- `clinics`: 医院情報
- `staff`: スタッフ情報
- `patients`: 患者情報
- `treatment_plans`: 診療計画
- `treatment_plan_items`: 診療計画項目
- `chat_messages`: チャットメッセージ
- `chat_summaries`: チャット要約

## 🎯 ロードマップ

### v1.0（現在）
- ✅ 基本的な患者・スタッフ機能
- ✅ AI相談機能
- ✅ PWA対応

### v2.0（予定）
- 📅 LINE連携
- 📅 複数医院対応
- 📅 操作ログ機能
- 📅 高度なAI学習機能

## 🚨 重要な注意事項

1. **医療情報の取り扱い**: 個人情報保護法・医療法に準拠した運用が必要
2. **AI相談の限界**: 診断行為ではなく、一般的な情報提供のみ
3. **緊急時対応**: 重篤な症状の場合は直接医院への連絡を促進

## 🤝 開発・運用

### ビルド
```bash
npm run build
```

### 本番環境デプロイ
Vercel、Netlify等のプラットフォームでのデプロイを推奨

### 環境変数（本番）
本番環境では必ず以下を適切に設定：
- HTTPSドメイン
- Supabase本番データベース
- OpenAI本番APIキー

## 📞 サポート

- **技術サポート**: [開発者連絡先]
- **医院サポート**: 大野城はち歯科

---

**PlanBee v1.0** - Made with ❤️ for dental care communication
