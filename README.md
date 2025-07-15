# TS-Fullstack-Todo-App

![CI](https://github.com/kozuyu-jp/ts-fullstack-todo-app/actions/workflows/ci.yml/badge.svg)


**TypeScript × Node.js 22** を中心に構築したモダンなタスク管理 SaaS のサンプル実装です。  
**pnpm モノレポ**・**NestJS**・**React + Vite**・**Prisma**・**AWS CDK / Lambda Web Adapter** などを採用し、
**実用レベルの設計・実装・運用フロー** を小規模構成で再現しています。  

<video src="https://github.com/kozuyu-jp/ts-fullstack-todo-app/raw/main/assets/demo.mov" controls width="600"></video>

---

## 目次

[✨ 主な機能](#✨-主な機能)  
[🛠️ 技術スタック](#🛠️-技術スタック)  
[📦 モノレポ構成](#📦-モノレポ構成)  
[⚙️ セットアップ](#⚙️-セットアップ)  
[💻 ローカル開発手順](#💻-ローカル開発手順)  
[🧪 テスト](#🧪-テスト)  
[🚀 デプロイ](#🚀-デプロイ)  
[🗺️ アーキテクチャ図](#🗺️-アーキテクチャ図)  


---

## ✨ 主な機能

- **トークンベースのユーザー認証**（サインアップ／ログイン/トークンリフレッシュ）  
- **タスク CRUD・検索・フィルタ**（締切日・ステータス・優先度）  
- **添付ファイル管理**（S3 署名付き URL、ドラッグ&ドロップ対応）  
- **リマインド通知**（締切が近いタスクが存在する場合、SES 送信、AWS Lambda + EventBridge Scheduler）  
- **ダークモード & WCAG AA 準拠のアクセシビリティ**  
- **OpenAPI から自動生成された型安全クライアント**  
- **CI**（Lint, 単体テスト, E2Eテストを GitHub Actions で自動化） 

---

## 🛠️ 技術スタック

| レイヤ | 主なライブラリ / サービス |
|-------|------------------------|
| **バックエンド** | NestJS, Prisma (PostgreSQL), Redis, JWT, Argon2, Swagger |
| **フロントエンド** | React, TypeScript, MUI, tanstack router, jotai, react-hook-form |
| **インフラ** | AWS CDK, Lambda, API Gateway, S3, SES, EventBridge Scheduler, CloudFront |
| **テスト** | Vitest, Cypress |
| **その他** | DevContainer, GitHub Actions | 


---

## 📦 モノレポ構成

```
├─ apps/
│  ├─ api/      # NestJS
│  └─ web/      # React
├─ packages/
│  ├─ shared/   # 共通型・ユーティリティ、環境変数定義
│  └─ api-client/ # OpenAPI 自動生成クライアント
└─ infra/       # CDK
```

---

## ⚙️ セットアップ

VSCode DevContainer を使用して、以下の手順でローカル開発環境をセットアップできます。  
1. 本リポジトリをクローンし、VSCode で開きます。  
2. DevContainer を起動します。（VS Code のコマンドパレットから "Dev Containers: Rebuild Container Without Cache" を選択）   
3. 依存関係が自動的にインストールされ、開発環境がセットアップされます。  

---

## 💻 ローカル開発手順

以下のコマンドでバックエンドとフロントエンドの開発サーバーを起動し、適宜コードを編集します。  

```bash
# バックエンドを起動
pnpm api start:dev   # http://localhost:3000

# フロントエンドを起動
pnpm web dev         # http://localhost:5173
```

バックエンドの編集内容によっては Swagger のドキュメントが自動的に更新されます。  
Swagger のドキュメントが更新された場合、以下のコマンドで API クライアントを再生成できます。  

```bash
pnpm gen:api
```

共通型やユーティリティの変更があった場合は、以下のコマンドで再ビルドします。  

```bash
pnpm shared build
```


## 🧪 テスト

```bash
pnpm api test                # NestJS 単体テスト
pnpm api test:e2e            # NestJS E2E テスト
pnpm web test:e2e            # E2E テスト (Cypress)
```

---

## 🚀 デプロイ

```bash
# stage は dev, stge, prod から選択
pnpm infra cdk:{{stage}} bootstrap  # 初期化
pnpm infra cdk:{{stage}} deploy     # デプロイ
```

---

## 🗺️ アーキテクチャ図

<img src="./assets/system-configuration-diagram.svg" alt="System Configuration Diagram"  />

