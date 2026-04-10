import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { username } = await req.json();

    if (!username || username.length < 3) {
      return NextResponse.json({ error: "名前は3文字以上で入力してください。" }, { status: 400 });
    }

    // 重複チェック
    const existingUser = await prisma.user.findUnique({
      where: { anonymousName: username },
    });

    if (existingUser) {
      return NextResponse.json({ error: "その名前は既に誰かが使用しています。" }, { status: 400 });
    }

    // 新規エージェント作成 (初期値設定)
    const newUser = await prisma.user.create({
      data: {
        anonymousName: username,
        role: "PLAYER",
        rank: "Z",
        balanceFlow: 1000,
        balanceStock: 0,
        balanceIgn: 0,
        skillLevel: 1.0,
      },
    });

    return NextResponse.json({ success: true, user: newUser });

  } catch (error: any) {
    console.error(`[REGISTER_ERROR] ${error.message}`);
    return NextResponse.json({ error: "サーバーエラーが発生しました。" }, { status: 500 });
  }
}
