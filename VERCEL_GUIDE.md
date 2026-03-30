# Vercel Deployment Guide for Ignitera Wallet

共有するために Vercel でデプロイするための手順です。

## 1. データベース (PostgreSQL) の準備
Vercel では SQLite が使えないため、PostgreSQL を使う必要があります（すでに `prisma/schema.prisma` は PostgreSQL 用に更新済みです）。

以下のいずれかでデータベースを作成し、`DATABASE_URL` を取得してください：
- **Vercel Postgres (推奨)**: Vercel コンソールから直接作成可能
- **Neon (無料枠あり)**: [neon.tech](https://neon.tech)
- **Supabase (無料枠あり)**: [supabase.com](https://supabase.com)

## 2. GitHub へのプッシュ
Vercel は GitHub と連携するのが最も簡単です。
```bash
git init
git add .
git commit -m "Initial commit for Vercel deployment"
# GitHub でリポジトリを作成し、リモートを追加
git remote add origin https://github.com/あなたのユーザー名/リポジトリ名.git
git push -u origin main
```

## 3. Vercel でのデプロイ
1. [Vercel](https://vercel.com) にログイン。
2. **Add New...** -> **Project** を選択。
3. リポジトリをインポート。
4. **Environment Variables** に以下を追加：
   - `DATABASE_URL`: 手順1で取得した接続文字列（例: `postgres://user:pass@host/db`）
5. **Deploy** をクリック！

## 4. データベースのセットアップ (デプロイ後)
初回デプロイが完了したら、手元のターミナルから以下のコマンドを実行してデータベースのテーブルを作成してください。
```bash
npx prisma db push
```

## 注意点
- `prisma/schema.prisma` を `postgresql` に変更したため、ローカルで動かす場合も PostgreSQL の `DATABASE_URL` が必要になります。ローカルで SQLite を使い続けたい場合は、provider を `sqlite` に戻し、`url` を `file:./dev.db` に再設定してください。
