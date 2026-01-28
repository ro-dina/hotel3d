"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

// =============================================================================
// 1. ASSETS & TEXTS
// =============================================================================

// ★ここにご提示いただいた全リストを格納しました
const SOURCE_IMAGES = [
  "/images/027c46d7-924b-43ad-a02a-b27b421affb5.jpg",
  "/images/030da007-caa3-4295-a16c-3a68f56eaaf3.jpg",
  "/images/03723bee-cf77-433d-8bd5-78eca2e58f74.jpg",
  "/images/03d2e852-5edf-4157-ba98-c4f5b755aae2.jpg",
  "/images/05a6652a-1d25-49a7-9ac8-305fad3bf2d0.jpg",
  "/images/120866f2-4156-4564-a0f5-61a83254c4a1.jpg",
  "/images/1431cbc3-0920-4f2f-9418-d8280dfe63f2.jpg",
  "/images/18024854-6614-4fd5-b2b6-205c81607e5e.jpg",
  "/images/19dfd19c-f643-4b31-b39f-ec084b32583e.jpg",
  "/images/1a5fd52d-5f2d-49ed-af5c-96373c7f0af5.jpg",
  "/images/1a66c051-60c1-458b-8517-7e9429aca13c.jpg",
  "/images/1c83bb9e-636e-42a4-a853-5e4921fc01cc.jpg",
  "/images/2606ca96-3f7b-417b-9741-04d620718bac.jpg",
  "/images/277a2108-91e1-4f8e-94dc-406e428bfce9.jpg",
  "/images/281a5ad8-790f-48bf-b621-d920cf1cf59b.jpg",
  "/images/2cb53887-0cdd-49e0-968c-1ddeba87c338.jpg",
  "/images/2d69820b-b9bc-4123-b885-3dc36d73cbbd.jpg",
  "/images/31875ccb-bda2-4ef3-8f34-6a6d6f29d8ac.jpg",
  "/images/32f2c648-3057-4010-b52e-380a83df0d61.jpg",
  "/images/335511a3-b05f-4101-9fc2-7ea097279f88.jpg",
  "/images/3b4fc536-2af0-4fbf-a9e9-1c783fad72f5.jpg",
  "/images/3d81de3c-61f7-4a29-b52f-b12fadcfe5e8.jpg",
  "/images/3e6e3923-8490-423e-9250-a4cacf9462e9.jpg",
  "/images/40017f8f-7944-41ae-9b82-e8c483051c59.jpg",
  "/images/41753cc2-d159-4c38-9ae2-9408f8b7b3f5.jpg",
  "/images/44790f43-45eb-484b-a5e3-bfffb2934b62.jpg",
  "/images/4ac43f95-ab98-4297-8b1a-a99c150e1f2a.jpg",
  "/images/4cbe6740-ff4b-42c7-8039-2f85ab8ca068.jpg",
  "/images/5042c676-e01a-492d-8269-406a476536f2.jpg",
  "/images/526a0702-a3c3-4b46-bbce-7a3201db0a2d.jpg",
  "/images/526cc4e5-064b-4098-a3a2-2b9ba6f7e61e.jpg",
  "/images/540d662d-46be-4be8-bbaf-135698d3a31c.jpg",
  "/images/54251a11-d185-4db5-9ee6-43d50091657b.jpg",
  "/images/54f03cba-147a-4b19-96b0-521c960975c8.jpg",
  "/images/593dcdc5-42aa-46e2-b0bc-0eeb6df43ff2.jpg",
  "/images/59951189-a6de-4790-9613-e4aed2aad2fd.jpg",
  "/images/5adfd558-8f6d-4717-884d-d0ac036749bc.jpg",
  "/images/5bceb744-bddf-4b6b-885d-19c21237da99.jpg",
  "/images/5da3fdf5-dfc2-435f-aa36-d85fdb571f65.jpg",
  "/images/5fb7dbe0-dda3-4e9a-abd5-3da83601af90.jpg",
  "/images/61220b82-61c5-4cdd-88f4-ea180157dd6a.jpg",
  "/images/64d4bfe5-4712-4bfa-bf1a-db274a27e5e3.jpg",
  "/images/65c39551-636b-4dfd-8bc6-b1876bde7944.jpg",
  "/images/67cbd867-28c1-4830-9270-d804bf5e391c.jpg",
  "/images/68cfe24a-6f05-4b33-b2b8-2e90950275b6.jpg",
  "/images/6925dc17-fd13-411d-9a1d-98d4e0cb1104.jpg",
  "/images/6992ca01-010e-4169-b44e-124293fac839.jpg",
  "/images/6fc32f26-81fd-43fa-86d8-c0b6e7573e72.jpg",
  "/images/744e10e2-d14f-4cd6-9938-89e5575f7611.jpg",
  "/images/746a91ff-1808-49c8-b03c-86d844c5c2eb.jpg",
  "/images/774bbc35-fca7-4b84-b1b3-a8810cc24445.jpg",
  "/images/77f116cb-9ffc-437d-aa89-c508f52bdcdf.jpg",
  "/images/79e3cd67-f987-4f7f-ad34-42840ac5b6c1.jpg",
  "/images/7b057039-3046-49ea-967f-5adbcfae37e1.jpg",
  "/images/7b1e47ba-120b-4c0c-b11c-bffb29e9a19d.jpg",
  "/images/7f4ee26f-f47a-479d-8a40-6ad5a074025b.jpg",
  "/images/8018af7e-694c-4e4a-9924-2f0c3e735b50.jpg",
  "/images/8305986b-3cb3-4f60-b9cb-95cd5b7062c3.jpg",
  "/images/84272a7c-ba26-4f30-8366-8e4678859ba0.jpg",
  "/images/879b44f5-1b55-45f9-a487-aaeb460a76d5.jpg",
  "/images/87d9ab25-1870-47ff-83c9-98431095eeb8.jpg",
  "/images/8afea1b1-0c28-4500-9fb8-7133fba9a924.jpg",
  "/images/8b2d15d5-8ba3-4b94-8d87-543b59319d8d.jpg",
  "/images/8ce294ce-ba66-446e-8fc0-4469809f13c2.jpg",
  "/images/8d319040-bbac-4fa0-b0bd-0037d09b167b.jpg",
  "/images/8f719d50-2817-4faa-9fcd-7346b466c4c8.jpg",
  "/images/9251af03-7b3e-434b-aef2-5a09866f896a.jpg",
  "/images/97d739d5-6401-4b17-bdb4-efab489e4298.jpg",
  "/images/999095ff-680c-4793-a8ee-b395b040f158.jpg",
  "/images/9a2cc29a-7263-4227-a02d-8412e0f55f86.jpg",
  "/images/9b5f7eb0-e983-4761-bf93-db013a65a7b6.jpg",
  "/images/9ca13f5a-1541-4334-bb03-7504e9dc62fd.jpg",
  "/images/9db6d077-6a16-4d79-93a8-7cb1494cec06.jpg",
  "/images/a5d2c3fc-8a4e-46d7-a96f-1dd7e231a53a.jpg",
  "/images/a6db54cb-4deb-4862-99f0-cd2e1a48373a.jpg",
  "/images/ae3d7f98-2fd1-4375-9814-c4b79b41bdfc.jpg",
  "/images/ae718d3d-9940-4bdf-9357-a828e5683f31.jpg",
  "/images/af4d8fc3-de6d-49de-9872-5865e56b481a.jpg",
  "/images/af523230-714f-45bf-a01f-8771e4cce0b8.jpg",
  "/images/b3f8583a-c671-43e8-8fef-06d4df91080d.jpg",
  "/images/b424b1a8-3394-4565-9c6e-1455ef87ea82.jpg",
  "/images/b6957b62-6ed9-4ccb-8e0d-8b90019e9efc.jpg",
  "/images/b9db9c2f-0a49-4c6e-8c84-a0a14f1b9158.jpg",
  "/images/ba9e617b-dc3f-4244-a0a2-623e72d7f7b9.jpg",
  "/images/bc1966e4-835e-4fc2-b86b-fefee5b41033.jpg",
  "/images/bd552387-1fb9-4c77-94d4-be111428e45a.jpg",
  "/images/bd822757-cae4-429d-b002-9580b7ac822f.jpg",
  "/images/c25f6542-d95c-42bf-bfec-3ec1a2a05e07.jpg",
  "/images/c56d389e-e764-4014-99e7-3019a98481c5.jpg",
  "/images/c57ce1a8-3abb-4afe-8168-82a55d35d87a.jpg",
  "/images/c589fe36-c06d-467d-bef4-d6d19aacdb98.jpg",
  "/images/c6ac07b3-2a22-425b-b856-f926e296f64c.jpg",
  "/images/c7e8f371-6971-411a-8dc0-7df9d686aad8.jpg",
  "/images/c9fa1745-7508-4a50-b7e1-17291d621fd6.jpg",
  "/images/ca7a45e1-be80-4829-b6d3-7caf8b797ccb.jpg",
  "/images/cdd09eee-3426-4357-8419-509498772541.jpg",
  "/images/ce081f9e-0814-433c-9846-46961eefff67.jpg",
  "/images/d005bbfd-dba4-4303-8132-3243da7a53b9.jpg",
  "/images/d1409e11-db08-43c6-846b-fa58ba271875.jpg",
  "/images/d29ffb23-4f36-456b-a5a5-a3669d77593c.jpg",
  "/images/d3237ff3-1340-4744-be3d-8a829314e678.jpg",
  "/images/d4c6cadd-4087-45aa-b06f-655dff52e9ab.jpg",
  "/images/d59e1c6e-f903-44de-8e57-c7ef68dd9ae1.jpg",
  "/images/d7a162cb-d302-4977-b87b-a86509a3c097.jpg",
  "/images/d7f6f053-793c-45b3-8b4d-4f4bb73bca1c.jpg",
  "/images/d827646e-7e75-44f3-a514-a49a9d69d4e9.jpg",
  "/images/d9acdbc8-a720-407e-9de2-fc5d2703a094.jpg",
  "/images/db2bde6a-626d-4083-8341-a46254ab8f88.jpg",
  "/images/dbe23bdb-c275-4cdf-91cf-d95faa3dc3da.jpg",
  "/images/dd3e2305-a7f6-42c5-b579-b799a4cde75b.jpg",
  "/images/ddee9df3-0524-4a27-9e6a-787577e2e24e.jpg",
  "/images/e062f878-65d8-490b-ad5f-c9015c098614.jpg",
  "/images/e1a53f14-11d8-46b7-83ff-45da2b14ba19.jpg",
  "/images/e4619caa-35f5-4d9b-a630-4e1bad081134.jpg",
  "/images/ee7fda42-f7f7-4c71-bfe1-fbc1c38f0192.jpg",
  "/images/f136368f-9d09-4d8b-89a4-945e2fe4a15d.jpg",
  "/images/f844a5b5-103e-424c-96ca-ef700beda832.jpg",
  "/images/f89da204-f070-4bf6-b08b-c7b2485ac3e0.jpg",
  "/images/f99edb7f-2f8e-4d82-9c50-9c8138edd1a2.jpg",
  "/images/f9abe458-b814-45ab-ae96-e7caa3dbfbe0.jpg",
  "/images/f9b073ca-948f-4737-bafb-9421d336aa17.jpg",
  "/images/fa97f689-6aae-44a5-9351-742ccb2f863a.jpg",
  "/images/fb53ac8f-18ac-4e83-b60c-9967a33111f4.jpg",
  "/images/fd385594-0edb-4454-b8da-080de259ebae.jpg",
  "/images/fdf54012-13f9-4c1b-9cec-5c864fbe7aba.jpg",
  "/images/hotel1.jpeg",
  "/images/hotel2.jpeg",
  "/images/kyoto1.png",
  "/images/kyoto2.png",
  "/images/osaka1.png",
  "/images/osaka2.png",
  "/images/sapporo1.png",
  "/images/sapporo2.png",
  "/images/tokyo1.png",
  "/images/tokyo2.png",
];

// 膨大なテキスト素材（ランダム配置用）
const HEADLINES = [
  "視覚情報の限界を突破する", "空間を「読む」から「歩く」へ", "ミスマッチ・ゼロの誓い",
  "想像力に頼らない予約", "距離と時間の圧縮", "デジタルの皮膚感覚",
  "歪みなき3Dの真実", "アバターによる身体性", "静止画の嘘を暴く", "その場所の空気を保存する",
  "DIMENSION SHIFT", "REALITY OVERRIDE", "NO MORE FAKE ANGLES", "PURE COORDINATES"
];

const CONCEPTS = [
  { ja: "自由な発想", en: "UNLIMITED CREATIVITY", color: "#FF0055" },
  { ja: "瞬時のデジタル化", en: "INSTANT DIGITIZATION", color: "#0055FF" },
  { ja: "正確な寸法", en: "PRECISE MEASUREMENT", color: "#00AA00" },
  { ja: "車椅子の動線確認", en: "ACCESSIBILITY CHECK", color: "#FFaa00" },
  { ja: "スーツケースの回転半径", en: "PHYSICAL SPACE", color: "#FF0055" },
  { ja: "家具の圧迫感", en: "OBJECT PRESSURE", color: "#0055FF" },
  { ja: "視点の高さ調整", en: "EYE LEVEL ADJUSTMENT", color: "#00AA00" },
  { ja: "外部API連携", en: "SYSTEM INTEGRATION", color: "#FFaa00" },
  { ja: "マルチデバイス", en: "CROSS PLATFORM", color: "#FF0055" },
  { ja: "Unityエンジンの解放", en: "POWERED BY UNITY", color: "#0055FF" },
  { ja: "Shade3Dによる精緻化", en: "HIGH POLYGON MESH", color: "#00AA00" },
  { ja: "没入型比較システム", en: "IMMERSIVE COMPARISON", color: "#FFaa00" },
  { ja: "空間の民主化", en: "SPATIAL DEMOCRACY", color: "#FF0055" },
  { ja: "感覚の同期", en: "SENSE SYNCHRONIZATION", color: "#0055FF" },
];

const LONG_TEXTS = [
  "F8VPS単独開発からの脱却と再定義。理想とするシステム実現のための破壊と創造。Unityの自由度がもたらす無限のインタラクション。",
  "アバターを介した対話。チャットボットによる即時回答。予約システムの内蔵とマイル連携。データ活用の未来。",
  "迅速かつ高精細な3Dスキャン技術の採用。スマートフォンのセンサー活用による超高速モデリング。実写と見紛う精度。",
  "競合他社の360度動画との決定的な違い。歪みの排除。通路幅の計測。家具のサイズ感。切実な確認ニーズへの応答。",
  "国ごとに異なる平均身長を考慮した視点変更機能。ユーザー個々の身体的属性への寄り添い。最適な宿泊体験の提供。",
  "ホテル選びというプロセスの革新。美しい写真の裏側にある真実。現地での小さな躓きの解消。記号的な情報からの脱却。",
  "メタバース空間での回遊。直感的な比較・体感。スタッフへの即時相談。予約から決済までのシームレスな完結。",
  "部屋の広さや空気感を肌で感じる3D技術。リアルタイムで人とつながる機能。画面越しの情報を確かな実感へ。",
  "一方的な「見る」予習から、深く「関わる」体験へ。不安やミスマッチの解消。誰もが納得して選べる安心な環境。",
  "複数のホテルをひとつの空間に集約。ブラウザタブ切り替えの廃止。アバターによる散策。直感的な比較検討。",
  "メタバース市場の拡大と宿泊業界の潮流。既存VRツアーの課題克服。導入コストの削減。データ容量の軽量化。",
  "「閲覧」と「予約」の統合。点在していた体験の接続。人の温かみを感じるシステム。ホテル選びの進化。",
  "ターゲットは10代から20代。少し贅沢な旅の実現。圧倒的な導入ハードルの低さ。スピーディーなモデル化。",
  "リゾートホテルから旅館、民泊へ。拡張性の高いシステム基盤。観光産業のさらなる開拓と未来のスタンダード。",
  "高解像度のテクスチャと物理ベースのライティング。虚構ではない、触れられそうな質感。",
  "XYZ軸の絶対的な座標。そこに曖昧さは存在しない。全ては計測可能であり、再現可能である。"
];
const LONG_TEXTS_2 = [
"制約からの脱却。私たちは当初の設計図を破り捨て、無限のキャンバスを手に入れた。ゲームエンジンの圧倒的な自由度が、静的なウェブサイトを動的なフィールドへと変える。アバターは単なるアイコンではなく、あなたの分身となり、デジタルの大地を踏みしめる。チャットボットとの対話、APIによる外部との接続。システムは生き物のように呼吸し、拡張し続ける。",
"レンズの湾曲が作り出す嘘を拒絶せよ。私たちが求めたのは、映えではなく「事実」だ。360度画像の歪んだパノラマではなく、XYZ軸を持つ正当なポリゴン。瞬きするほどの速度で空間をキャプチャし、空気の粒子さえもデータ化する。そこにあるのは、飾られた美しさではなく、触れられそうなリアリティ。",
"身長150cmの視界と、180cmの視界は違う。車椅子の動線、スーツケースの回転半径。画面越しの「なんとなく」を、身体感覚としての「確信」へ。私たちは、あなたの身体的属性をデジタル空間に投影する。家具の圧迫感を知る。通路の余白を知る。それは、ただ見るだけでなく、そこに「居る」という感覚の再定義。",
"「思ったより狭い」という落胆は、旅の彩度を下げるノイズだ。美しい写真の羅列は、時に残酷なミスマッチを生む。だからこそ、私たちは予習を体験へと昇華させる。記号的なスペック表ではなく、空間そのものを泳ぐこと。光の入り方、机の高さ、部屋の隅々の気配。予約ボタンを押すその瞬間に、一切の曇りなき納得を。",
"ブラウザのタブを行き来する放浪は終わる。複数のホテル、複数のリゾートが、ひとつの巨大なメタバースに集結する。街を歩くようにホテルをハシゴし、気になったらその場でアバターに話しかける。比較、検討、相談、そして決済。すべてのフローが分断されることなく、滑らかに接続されたひとつの物語になる。",
"高度な技術は魔法と区別がつかないというが、私たちの技術は「透明」でありたい。スキャンの高速化、レンダリングの軽量化、それらはすべて裏側の出来事。あなたが感じるのは、ただただ直感的な心地よさと、圧倒的な納得感だけ。複雑な計算式は、シンプルな「あ、ここいいな」という感情のために奉仕する。",
"「写真が綺麗だから予約したのに、実際は古くて狭かった」。この典型的なミスマッチは、2D写真の情報量不足が原因です。私たちは空間を丸ごと記録することで、壁の質感、床の段差、コンセントの位置といった「生活に必要な情報」を可視化します。驚きを売るのではなく、安心を提供するための3D化です。",
"広角レンズで撮影された不動産やホテルの写真は、しばしば部屋を実際よりも広く見せてしまいます。メタバニアの3Dモデルは、空間座標に基づいた正確な縮尺で表示されます。通路は通れる幅なのか、デスクは仕事ができる広さなのか。演出された広さではなく、物理的な「寸法」を確認できることが最大の価値です。",
"旅行者の事情は千差万別です。車椅子を利用する方、小さなお子様連れの方、大きな荷物を持つビジネスマン。それぞれの視点で「この部屋で快適に過ごせるか」を確認するには、静止画では不十分です。アバターを操作し、実際の動線をシミュレーションすることで、個人のニーズに合致した部屋選びが可能になります。",
"これまでのVRやデジタルツイン技術は、高額な専用機材と長い撮影期間を必要としました。しかし、私たちのシステムは汎用的なデバイスを活用し、わずか数分でスキャンを完了させます。導入コストを劇的に下げることで、高級リゾートだけでなく、ビジネスホテルや民泊など、あらゆる宿泊施設への展開を実現します。",
"複数の宿泊予約サイトを行き来し、ブラウザのタブを数十個開く必要はありません。メタバニアでは、複数の候補施設を同一の3D空間内で比較できます。Aホテルの広さとBホテルの設備を、記憶に頼らず直感的に見比べる。これにより、検討にかかる時間を短縮し、より納得感のある意思決定をサポートします。",
"3Dで部屋を見て終わりではありません。気に入った部屋があれば、その画面上のUIから直接予約フローへと進めます。在庫状況の確認、プランの選択、決済までをスムーズに接続。体験からアクションまでの断絶をなくし、ユーザーの購買意欲を逃さない設計を行っています。",
"「部屋からの眺望は？」「アメニティの詳細は？」といった細かな疑問を、電話やメールで問い合わせるのは手間がかかります。3D空間内に配置されたチャットボットやスタッフアバターにその場で質問することで、疑問を即座に解決。有人対応と自動応答を組み合わせ、効率的な顧客対応を実現します。",
"一度スキャンされた3Dデータは、単なる閲覧用コンテンツに留まりません。改修工事のシミュレーション、家具配置の検討、スタッフ研修用の資料など、多目的に活用できる「デジタル資産」となります。一度の撮影で多角的な価値を生み出す、効率的なデータ運用を提案します。",
"専用アプリのダウンロードは、ユーザーにとって大きな心理的ハードルです。私たちはWeb標準技術（WebGL）を採用し、スマホやPCのブラウザだけで動作する環境を構築しました。URLをクリックするだけですぐに体験が始まる。このアクセシビリティの高さが、多くのユーザーに利用される理由です。",
"良い部分だけを切り取るのではなく、ありのままを伝えること。それが結果として顧客の信頼獲得に繋がります。洗面所の狭さや、窓からの景色の遮蔽物など、ネガティブな要素も含めて事前に確認できれば、それは「納得」に変わります。到着後のクレームを未然に防ぐ、誠実な情報開示の形です。",
"現在はリゾートホテルを中心に展開していますが、このシステムの応用範囲は広大です。不動産の内見、結婚式場の下見、イベント会場のロケハンなど、空間確認が必要なあらゆるビジネスシーンに対応可能です。宿泊予約システムとして培ったノウハウを基盤に、空間ビジネスのプラットフォームを目指します。",
"没入感を重視しつつも、予約に必要な情報は明確なUIで提示します。料金、空室カレンダー、設備アイコン。これらを3D空間の手前にレイヤーとして適切に配置することで、「迷わずに使える」実用性を確保しています。新技術の面白さと、予約サイトとしての使いやすさの両立を追求しています。",
"リピート率の向上] 「期待通りだった」「安心して泊まれた」という体験は、次の利用への動機付けになります。ギャップのない宿泊体験を提供することで、顧客満足度を高め、ホテルのファンを増やします。メタバニアは単なる集客ツールではなく、顧客ロイヤリティを高めるためのブランディングツールでもあります。",
"既存のホテル管理システム（PMS）や予約エンジンとのAPI連携を前提に設計されています。在庫のリアルタイム同期や、会員情報の統合など、ホテルの既存オペレーションを阻害することなく、新しい付加価値を追加導入することが可能です。"
];

// =============================================================================
// 2. HELPER FUNCTIONS (Pure Logic)
// =============================================================================

// 配列をシャッフルして新しい配列を返す関数
const shuffleArray = (array: string[]) => {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

// =============================================================================
// 3. MAIN COMPONENT
// =============================================================================
// 背景用のフワフワしているテキストの型
type BgTextItem = {
  text: string;
  top: number;
  left: number;
  rotate: number;
  scale: number;
  opacity: number;
};

// セクション4.5用のうるさいテキストの型（色や太さも含む）
type PracticalTextItem = {
  text: string;
  top: number;
  left: number;
  rotate: number;
  scale: number;
  opacity: number;
  weight: number; // font-weight用
  color: string;
  zIndex: number;
};
export default function AboutPage() {
  const [show3D, setShow3D] = useState(false);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  // UIで使用する画像をランダム決定して格納するステート
  // 初期値は空で、useEffectでクライアントサイドでのみ埋める
  const [randomizedImages, setRandomizedImages] = useState<string[]>([]);
  const [bgTexts, setBgTexts] = useState<BgTextItem[]>([]);
  const [practicalTexts, setPracticalTexts] = useState<PracticalTextItem[]>([]);
  // 起動時に画像をランダムに割り振る（SSR不整合回避）
  useEffect(() => {
    // 全リストからシャッフルして先頭20枚を取得
    const shuffled = shuffleArray(SOURCE_IMAGES);
    setRandomizedImages(shuffled.slice(0, 20));

    // 背景の文字もランダム生成
    const texts = Array.from({ length: 30 }).map((_, i) => ({
      text: LONG_TEXTS[Math.floor(Math.random() * LONG_TEXTS.length)],
      top: Math.random() * 100,
      left: Math.random() * 100,
      rotate: Math.random() * 360,
      scale: Math.random() * 0.5 + 0.5,
      opacity: Math.random() * 0.15,
    }));
    setBgTexts(texts);

    const handleMouseMove = (e: MouseEvent) => {
      setMouse({ x: (e.clientX / window.innerWidth) * 2 - 1, y: (e.clientY / window.innerHeight) * 2 - 1 });
    };

    // ★追加: LONG_TEXTS_2 をランダム配置するためのデータ生成
    // 「うるさく」するために数を多め(40個)にし、opacityを高めに設定
    const pTexts = Array.from({ length: 50 }).map(() => ({
      text: LONG_TEXTS_2[Math.floor(Math.random() * LONG_TEXTS_2.length)],
      top: Math.random() * 100,      // 0% ~ 100% の位置
      left: Math.random() * 90,      // 画面からはみ出しすぎないように
      rotate: (Math.random() - 0.5) * 40, // -20度 ~ 20度 の傾き
      scale: Math.random() * 1.5 + 0.8,   // 0.8倍 ~ 2.3倍 (サイズ差をつける)
      opacity: Math.random() * 0.4 + 0.1, // 0.1 ~ 0.5 (既存より濃いめ)
      weight: Math.random() > 0.5 ? 900 : 400, // 太字と細字を混ぜる
      color: Math.random() > 0.7 ? "#FF0055" : "#111", // たまに赤文字
      zIndex: Math.floor(Math.random() * 10)
    }));
    setPracticalTexts(pTexts);

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // ローディング待機（ハイドレーション・ミスマッチ防止）
  if (randomizedImages.length === 0) return <div style={{ background: "#f4f4f0", height: "100vh" }} />;

  return (
    <main style={{ 
      backgroundColor: "#f4f4f0", 
      color: "#111", 
      fontFamily: '"Helvetica Neue", Arial, "Hiragino Kaku Gothic ProN", sans-serif',
      overflowX: "hidden",
      position: "relative"
    }}>
      <GlobalStyles />
      
      {/* 背景パターン */}
      <div style={{ position: "fixed", inset: 0, backgroundImage: "radial-gradient(#ccc 1px, transparent 1px)", backgroundSize: "20px 20px", zIndex: 0, opacity: 0.5 }} />

      {/* ------------------------------------------------------------------
          SECTION 1: HERO COLLAGE (RANDOM STICKERS)
         ------------------------------------------------------------------ */}
      <section style={{ minHeight: "100vh", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", padding: "100px 20px" }}>
        <ScrollText text="ARCHITECTURE" y="10%" speed={0.5} direction={1} />
  <ScrollText text="DIGITAL TWIN" y="40%" speed={0.8} direction={-1} color="rgba(255, 0, 85, 0.05)" />
        {/* 背景で暴れる巨大文字 */}
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%) rotate(-10deg)", width: "120vw", textAlign: "center", zIndex: 0, opacity: 0.1, pointerEvents: "none" }}>
            {HEADLINES.map((text, i) => (
                <div key={i} style={{ fontSize: "8vw", fontWeight: 900, lineHeight: 0.9, whiteSpace: "nowrap" }}>{text}</div>
            ))}
        </div>

        <div style={{ position: "relative", zIndex: 10, maxWidth: 1400, width: "100%" }}>
            
            <div style={{ position: "relative", marginBottom: 50, mixBlendMode: "hard-light" }}>
                <h1 style={{ fontSize: "clamp(60px, 12vw, 160px)", fontWeight: 900, lineHeight: 0.85, letterSpacing: "-0.04em", margin: 0 }}>
                    <span style={{ display: "block", color: "#111" }}>HOTEL3D</span>
                    <span style={{ display: "block", color: "#FF0055", transform: "translateX(40px)" }}>PROTOCOL</span>
                </h1>
                <div style={{ position: "absolute", top: -20, left: -20, background: "#0055FF", color: "#fff", padding: "5px 15px", transform: "rotate(-5deg)", fontWeight: "bold" }}>
                    V.13.2.4 UPDATED
                </div>
            </div>

            {/* Grid Layout: スマホでは縦並び(grid-cols-1)、PCでは12分割(lg:grid-cols-12) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-5 items-start">
                
                {/* 画像スタック 
                   スマホでは下に表示 (order-2)
                   PCでは左側5カラム (lg:col-span-5 lg:order-1)
                */}
                <div className="order-2 lg:order-1 lg:col-span-5 relative h-[400px] lg:h-[500px]">
                    {/* 1枚目 */}
                    <div className="sticker-img" style={{ transform: `rotate(-3deg) translate(${mouse.x * 10}px, ${mouse.y * 10}px)` }}>
                        <Image src={randomizedImages[0]} alt="Sticker 1" fill style={{ objectFit: "cover" }} />
                        <div className="tape" />
                    </div>
                    {/* 2枚目 */}
                    <div className="sticker-img" style={{ top: 100, left: 50, transform: `rotate(5deg) translate(${mouse.x * -20}px, ${mouse.y * -20}px)`, zIndex: 2 }}>
                        <Image src={randomizedImages[1]} alt="Sticker 2" fill style={{ objectFit: "cover" }} />
                        <div className="tape" style={{ transform: "rotate(90deg)", left: "40%", top: -20 }} />
                    </div>
                    {/* 3枚目 */}
                     <div className="sticker-img" style={{ width: 150, height: 150, top: -50, right: -20, transform: `rotate(15deg) translate(${mouse.x * 15}px, ${mouse.y * 15}px)`, zIndex: 3 }}>
                        <Image src={randomizedImages[2]} alt="Sticker 3" fill style={{ objectFit: "cover" }} />
                        <div className="tape" />
                    </div>
                    
                    <div style={{ position: "absolute", bottom: 0, left: -40, width: 160, height: 160, background: "#FFaa00", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 20, transform: "rotate(-15deg)", zIndex: 5, boxShadow: "5px 5px 0 #111", textAlign: "center" }}>
                        NO MORE<br/>MISMATCH
                    </div>
                </div>

                {/* テキストコラージュ 
                   スマホでは上に表示 (order-1)
                   PCでは右側7カラム (lg:col-span-7 lg:order-2)
                */}
                <div className="order-1 lg:order-2 lg:col-span-7 relative lg:pl-10">
                    <p style={{ fontSize: "clamp(18px, 2.5vw, 32px)", fontWeight: 800, lineHeight: 1.4, background: "#fff", display: "inline", boxShadow: "10px 0 0 #fff, -10px 0 0 #fff", boxDecorationBreak: "clone" }}>
                        写真の向こう側にある「空気感」まで。<br/>
                        Hotel3Dは宿泊施設の空間を<br/>
                        <span style={{ color: "#0055FF" }}>「読む」</span>情報から<br/>
                        <span style={{ color: "#FF0055" }}>「歩く」</span>体験へと書き換えます。
                    </p>
                    
                    <div style={{ marginTop: 60, display: "flex", flexWrap: "wrap", gap: 15 }}>
                        {["Unity Engine", "WebGL", "Shade3D", "LiDAR", "Realtime", "Physics", "V.R."].map((tag, i) => (
                            <span key={i} style={{ padding: "10px 20px", border: "2px solid #111", borderRadius: 30, fontSize: 14, fontWeight: 700, background: i % 2 === 0 ? "#111" : "transparent", color: i % 2 === 0 ? "#fff" : "#111" }}>
                                #{tag}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------
          SECTION 2: MARQUEE STORM
         ------------------------------------------------------------------ */}
      <section style={{ padding: "40px 0", background: "#111", color: "#fff", transform: "skewY(-2deg)", borderTop: "5px solid #FF0055", borderBottom: "5px solid #0055FF" }}>
        <ScrollText text="ARCHITECTURE" y="10%" speed={0.5} direction={1} />
  <ScrollText text="DIGITAL TWIN" y="40%" speed={0.8} direction={-1} color="rgba(255, 0, 85, 0.05)" />
         <Marquee text={HEADLINES.join(" /// ")} speed={30} direction="left" color="#fff" />
         <Marquee text={HEADLINES.reverse().join(" /// ")} speed={40} direction="right" color="#FFaa00" outline />
         <Marquee text="METAVANIA SYSTEM /// UNITY INTEGRATION /// IMMERSIVE BOOKING /// " speed={25} direction="left" color="#0055FF" />
      </section>

      {/* ------------------------------------------------------------------
          SECTION 3: SCATTERED CONCEPTS & RANDOM BG TEXT
         ------------------------------------------------------------------ */}
      <section style={{ padding: "150px 20px", position: "relative", overflow: "hidden" }}>
        <ScrollText text="ARCHITECTURE" y="10%" speed={0.5} direction={1} />
  <ScrollText text="DIGITAL TWIN" y="40%" speed={0.8} direction={-1} color="rgba(255, 0, 85, 0.05)" />  
         {/* 背景テクスチャ（ランダム生成済み） */}
         <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            {bgTexts.map((item, i) => (
                <div key={i} style={{ 
                    position: "absolute", 
                    top: `${item.top}%`, 
                    left: `${item.left}%`, 
                    width: "300px", 
                    fontSize: "12px", 
                    transform: `rotate(${item.rotate}deg) scale(${item.scale})`,
                    opacity: item.opacity
                }}>
                    {item.text}
                </div>
            ))}
         </div>

         <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 10 }}>
            <h2 style={{ fontSize: "clamp(40px, 6vw, 80px)", fontWeight: 900, textAlign: "center", marginBottom: 80 }}>
                WHY <span style={{ textDecoration: "underline", textDecorationColor: "#FF0055", textDecorationThickness: "10px" }}>3D?</span>
            </h2>

            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 30 }}>
                {CONCEPTS.map((item, i) => (
                    <div key={i} 
                         className="concept-card"
                         style={{ 
                             transform: `rotate(${(i % 2 === 0 ? 1 : -1) * (Math.random() * 5 + 2)}deg)`,
                             borderColor: item.color
                         }}>
                        <div style={{ fontSize: 12, fontWeight: 900, color: item.color, marginBottom: 5 }}>{item.en}</div>
                        <div style={{ fontSize: 24, fontWeight: 800 }}>{item.ja}</div>
                        {/* 飾り画像（ランダムリストの 3番目以降を使用） */}
                        {i < 4 && (
                            <div style={{ position: "absolute", top: -20, right: -20, width: 60, height: 60, borderRadius: "50%", overflow: "hidden", border: "3px solid #111" }}>
                                <Image src={randomizedImages[i + 3]} alt="" fill style={{ objectFit: "cover" }} />
                            </div>
                        )}
                        <div style={{ position: "absolute", top: -10, left: "50%", width: 12, height: 12, borderRadius: "50%", background: "#ccc", boxShadow: "1px 1px 2px rgba(0,0,0,0.3)" }} />
                    </div>
                ))}
            </div>
         </div>
      </section>

{/* ------------------------------------------------------------------
          SECTION 4: MAGAZINE LAYOUT (EXPANDED)
         ------------------------------------------------------------------ */}
      <section style={{ padding: "100px 5%", background: "#fff", position: "relative" }}>
          <div style={{ maxWidth: 1400, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: 60 }}>
              
              {/* BLOCK 1: STRATEGY (既存) */}
              <div className="mag-col">
                  <h3 className="mag-title" style={{ background: "#FF0055" }}>STRATEGY</h3>
                  <p className="mag-text">
                    <strong>当初、F8VPS単独での開発を進めていましたが、</strong>理想とするシステム実現には機能面での制約がありました。そこで、開発元であるフォーラムエイト様からの「自由に発想してほしい」との助言を受け、方針を再定義。現在はゲームエンジン「Unity」の高い自由度を活用した開発体制をとっています。
                    <br/><br/>
                    <span className="highlight yellow">この構成により、アバターを介したスタッフとの対話やチャットボットといった高度なインタラクションの実装も見据えています。</span>
                  </p>
                  <div style={{ marginTop: 20, padding: 20, border: "4px solid #111", background: "#f9f9f9", transform: "rotate(-2deg)" }}>
                      <strong style={{ fontSize: 20 }}>F8VPS × Unity</strong>
                      <p style={{ margin: "10px 0 0", fontSize: 14, color: "#555" }}>
                          Shade3Dを経由することで、生成したモデルは特定のプラットフォームに依存することなく、デジタル資産として多角的に活用できる体制を整えています。
                      </p>
                  </div>
              </div>

              {/* BLOCK 2: EXPERIENCE (既存) */}
              <div className="mag-col" style={{ marginTop: 80 }}>
                  <h3 className="mag-title" style={{ background: "#0055FF" }}>EXPERIENCE</h3>
                  <div style={{ position: "relative", height: 250, marginBottom: 20, overflow: "hidden", border: "3px solid #111" }}>
                      <Image src={randomizedImages[7]} alt="" fill style={{ objectFit: "cover" }} />
                      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(transparent, rgba(0,0,0,0.8))" }} />
                      <div style={{ position: "absolute", bottom: 20, left: 20, color: "#fff", fontSize: 24, fontWeight: 900 }}>REAL SCALE</div>
                  </div>
                  <p className="mag-text">
                    <strong>競合他社の360度動画とは異なり、</strong>私たちはあくまで「正確な寸法」を持つ3Dモデルにこだわります。360度画像特有の空間の歪みを排除することで、通路の幅や家具のサイズ感を正確に計測できる点が最大の強みです。
                    <br/><br/>
                    「車椅子が通れるか」「大きなスーツケースを広げられるか」といった切実な確認ニーズに応えることができます。
                  </p>
              </div>

              {/* BLOCK 3: FUTURE (既存) */}
              <div className="mag-col">
                   <h3 className="mag-title" style={{ background: "#00AA00" }}>FUTURE</h3>
                   <p className="mag-text">
                       <strong>サービス利用者にとっての価値。</strong>それは「思ったより狭かった」「作業がしづらかった」という現地での小さな躓きをゼロにすること。本当に必要なのは、料金や立地といった記号的な情報だけでなく、そこで過ごす時間を想像できる「リアルな感覚」です。
                   </p>
                   <ul style={{ listStyle: "none", padding: 0, marginTop: 30 }}>
                       {["マルチバース集約", "アバター相談機能", "即時決済連携", "観光産業の開拓"].map((item, i) => (
                           <li key={i} style={{ borderBottom: "2px solid #ddd", padding: "15px 0", fontSize: 18, fontWeight: 700, display: "flex", justifyContent: "space-between" }}>
                               <span>{item}</span>
                               <span>➔</span>
                           </li>
                       ))}
                   </ul>
              </div>

              {/* BLOCK 4: VELOCITY (新規 - 開発速度) */}
              <div className="mag-col" style={{ marginTop: 40 }}>
                  <h3 className="mag-title" style={{ background: "#FFaa00" }}>VELOCITY</h3>
                  <p className="mag-text">
                      <strong>空間のデジタル化における最大の障壁、</strong>それはスキャンにかかる時間とコストでした。私たちは一般的なスマートフォンのLiDARセンサーとShade3Dを組み合わせることで、このプロセスを劇的に短縮しました。
                      <br/><br/>
                      実証実験では、8畳の客室をわずか5分未満でモデル化。専門機材を搬入することなく、たった一名で完結するこのワークフローは、中小規模の宿泊施設にとっての「3D導入革命」となります。
                  </p>
                  <div style={{ marginTop: 20, height: 10, background: "repeating-linear-gradient(45deg, #FFaa00, #FFaa00 10px, #fff 10px, #fff 20px)", border: "2px solid #111" }} />
              </div>

              {/* BLOCK 5: INTEGRATION (新規 - システム連携) */}
              <div className="mag-col">
                  <h3 className="mag-title" style={{ background: "#9900FF" }}>INTEGRATION</h3>
                  <div style={{ position: "relative", height: 200, marginBottom: 20, overflow: "hidden", border: "3px solid #111", transform: "rotate(2deg)" }}>
                      <Image src={randomizedImages[4]} alt="" fill style={{ objectFit: "cover", filter: "grayscale(100%)" }} />
                      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", background: "#fff", padding: "10px 20px", fontWeight: 900, border: "2px solid #111" }}>API CONNECT</div>
                  </div>
                  <p className="mag-text">
                      <strong>「見るだけ」で終わらせない。</strong>既存のVRツアーの弱点は、予約システムとの分断にありました。Metavaniaは、外部API連携を前提に設計されており、PMS（ホテル管理システム）の在庫状況をリアルタイムに反映します。
                      <br/><br/>
                      <span className="highlight yellow">気に入った部屋があれば、その場ですぐに予約を確定。マイル連携やポイント利用も、3D空間内のインターフェースで完結させます。</span>
                  </p>
              </div>

              {/* BLOCK 6: TARGETING (新規 - ターゲット層) */}
              <div className="mag-col" style={{ marginTop: 60 }}>
                  <h3 className="mag-title" style={{ background: "#FF0055" }}>TARGETING</h3>
                  <p className="mag-text">
                      サービスの主役となるのは、デジタルネイティブである10代から20代の学生や新社会人です。彼らが憧れる「少し贅沢な旅」を叶えるため、まずは一泊1.5万〜2.5万円前後のリゾートホテルをターゲットに提携を進めます。
                  </p>
                  <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                      <div style={{ flex: 1, padding: 15, background: "#111", color: "#fff", textAlign: "center", fontWeight: 700 }}>GEN Z</div>
                      <div style={{ flex: 1, padding: 15, background: "#eee", color: "#111", textAlign: "center", fontWeight: 700 }}>DIGITAL</div>
                  </div>
                  <p className="mag-text" style={{ marginTop: 20 }}>
                      スマホで3Dゲームを遊ぶ感覚で、旅先を選ぶ。この新しい行動様式を定着させることが、私たちのマーケティングの核心です。
                  </p>
              </div>

              {/* BLOCK 7: HONESTY (新規 - 情報の透明性) */}
              <div className="mag-col">
                  <h3 className="mag-title" style={{ background: "#000", color: "#fff" }}>HONESTY</h3>
                  <p className="mag-text">
                      <strong>「行ってみたら期待はずれだった」</strong>という経験は、顧客のロイヤリティを著しく損ないます。私たちは、あえて「狭さ」や「死角」も含めて包み隠さず3D化します。
                      <br/><br/>
                      ネガティブな要素も事前に把握できていれば、それは「納得」に変わります。誠実な情報開示こそが、クレームを未然に防ぎ、結果として高い顧客満足度とリピート率を生み出すのです。
                  </p>
              </div>

              {/* BLOCK 8: ASSET (新規 - 資産価値) */}
              <div className="mag-col" style={{ marginTop: 30 }}>
                  <h3 className="mag-title" style={{ background: "#00AA00" }}>ASSET</h3>
                  <div style={{ position: "relative", height: 180, marginBottom: 20, overflow: "hidden", border: "3px solid #111" }}>
                      <Image src={randomizedImages[5]} alt="" fill style={{ objectFit: "cover" }} />
                      <div style={{ position: "absolute", bottom: 0, right: 0, background: "#00AA00", color: "#fff", padding: "5px 15px", fontWeight: 700 }}>DATA RE-USE</div>
                  </div>
                  <p className="mag-text">
                      生成した3Dモデルは、予約サイトのためだけの使い捨てではありません。F8VPSへの実装はもちろん、改修工事のシミュレーション、家具配置の検討、スタッフのオペレーション研修など、多角的に活用可能です。
                      <br/><br/>
                      一度のスキャンが、経営判断を支える永続的な「デジタル資産」へと変わります。
                  </p>
              </div>

              {/* BLOCK 9: GLOBAL (新規 - 世界展開) */}
              <div className="mag-col" style={{ marginTop: 90 }}>
                  <h3 className="mag-title" style={{ background: "#0055FF" }}>GLOBAL</h3>
                  <p className="mag-text">
                      <strong>視覚情報に「言語の壁」はありません。</strong>3D空間での体験は、翻訳を介さずに世界中の旅行者に魅力を伝えます。さらに、国ごとに異なる平均身長を考慮した「視点変更機能」を搭載。
                  </p>
                  <div style={{ padding: 15, border: "2px dashed #0055FF", marginTop: 20, background: "#eef" }}>
                      <strong style={{ color: "#0055FF" }}>Universal View</strong>
                      <p style={{ margin: "5px 0 0", fontSize: 13 }}>
                          150cmの視点、190cmの視点。ユーザーの身体的属性に寄り添った最適な宿泊体験を、世界規模で提供します。
                      </p>
                  </div>
              </div>

          </div>
      </section>      
      {/* ------------------------------------------------------------------
          ★追加: SECTION 4.5: CHAOTIC TEXT RAIN (機能的テキストの嵐)
         ------------------------------------------------------------------ */}
      <section style={{ 
          padding: "120px 0", 
          position: "relative", 
          overflow: "hidden", 
          background: "#f4f4f0", 
          borderTop: "10px solid #111",
          borderBottom: "10px solid #111"
      }}>
          {/* 背景の装飾: 斜めストライプ */}
          <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(45deg, #e5e5e5 25%, transparent 25%, transparent 50%, #e5e5e5 50%, #e5e5e5 75%, transparent 75%, transparent)", backgroundSize: "40px 40px", opacity: 0.5 }} />

          {/* ランダムテキスト配置エリア */}
          <div style={{ position: "relative", height: "80vh", maxWidth: "100%", overflow: "hidden" }}>
              {practicalTexts.map((item, i) => (
                  <div key={i} style={{
                      position: "absolute",
                      top: `${item.top}%`,
                      left: `${item.left}%`,
                      transform: `rotate(${item.rotate}deg) scale(${item.scale})`,
                      opacity: item.opacity,
                      color: item.color,
                      fontWeight: item.weight,
                      fontSize: "clamp(14px, 2vw, 24px)",
                      zIndex: item.zIndex,
                      whiteSpace: "nowrap",
                      pointerEvents: "none",
                      // 雑誌の切り抜きのような背景をつける
                      background: item.color === "#FF0055" ? "#111" : "transparent",
                      padding: item.color === "#FF0055" ? "5px 10px" : "0",
                  }}>
                      {item.text}
                  </div>
              ))}
              
              {/* 中央に強いメッセージを配置（カオスの中に秩序を作る） */}
              <div style={{ 
                  position: "absolute", 
                  top: "50%", 
                  left: "50%", 
                  transform: "translate(-50%, -50%)", 
                  background: "#fff",
                  padding: "40px 60px",
                  border: "5px solid #111",
                  boxShadow: "20px 20px 0 #FF0055",
                  zIndex: 20,
                  textAlign: "center"
              }}>
                  <h3 style={{ fontSize: "clamp(24px, 4vw, 40px)", fontWeight: 900, margin: 0, lineHeight: 1.2 }}>
                      LOGIC <span style={{ color: "#FF0055" }}>&</span> EMOTION
                  </h3>
                  <p style={{ marginTop: 20, fontWeight: 700, fontSize: "14px" }}>
                      データに基づいた「正解」と、<br/>感性に訴える「体験」の融合。
                  </p>
              </div>
          </div>
      </section>

      {/* ------------------------------------------------------------------
          SECTION 5: FOOTER CTA
         ------------------------------------------------------------------ */}
      <section style={{ height: "80vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative", background: "#f4f4f0", overflow: "hidden" }}>
          
          <div style={{ position: "absolute", animation: "spin 20s linear infinite" }}>
             <svg width="600" height="600" viewBox="0 0 100 100">
                <path id="circlePath" d="M 50, 50 m -35, 0 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0" fill="none" />
                <text fill="#ccc" fontSize="6" fontWeight="bold" letterSpacing="2">
                   <textPath href="#circlePath">METAVANIA PROJECT /// UNITY WEBGL /// SHADE3D /// </textPath>
                </text>
             </svg>
          </div>

          <div style={{ zIndex: 10, textAlign: "center" }}>
              <h2 style={{ fontSize: "clamp(30px, 4vw, 50px)", fontWeight: 900, marginBottom: 40, background: "#111", color: "#fff", padding: "10px 40px", transform: "rotate(-2deg)", display: "inline-block" }}>
                  百聞は、一見にしかず。
              </h2>
              <br/>
              <div style={{ display: "flex", gap: 20, justifyContent: "center", marginTop: 20, flexWrap: "wrap" }}>
                  <Link href="/view3d/1" className="cta-button primary">
                      3D空間へダイブする
                  </Link>
                  <button onClick={() => setShow3D(true)} className="cta-button secondary">
                      DEMO MODE
                  </button>
              </div>
          </div>
      </section>

      {/* ------------------------------------------------------------------
          MODAL
         ------------------------------------------------------------------ */}
      {show3D && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(17,17,17,0.95)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: "95%", height: "90%", background: "#000", border: "2px solid #FF0055", position: "relative" }}>
            <div style={{ position: "absolute", top: -30, left: 0, background: "#FF0055", color: "#fff", padding: "5px 10px", fontWeight: "bold" }}>UNITY WEBGL CONTAINER</div>
            <button onClick={() => setShow3D(false)} style={{ position: "absolute", top: -40, right: 0, color: "#fff", background: "none", border: "none", fontSize: 20, cursor: "pointer" }}>[ CLOSE X ]</button>
            <iframe src="/unity/hotel1/index.html" style={{ width: "100%", height: "100%", border: "none" }} />
          </div>
        </div>
      )}
    </main>
  );
}

// =============================================================================
// 4. SUB COMPONENTS
// =============================================================================
// Marqueeコンポーネント用の型
type MarqueeProps = {
  text: string;
  speed: number;
  direction: "left" | "right"; // 文字列リテラル型で制限するとより安全です
  color?: string;  // 省略可能にする場合は ? をつけます
  outline?: boolean;
};

// ScrollTextコンポーネント用の型
type ScrollTextProps = {
  text: string;
  direction?: number; // 1 または -1
  speed?: number;
  y?: string | number; // "10%" や 0 など
  color?: string;
};
const Marquee = ({ text, speed, direction, color, outline }: MarqueeProps) => (
    <div style={{ overflow: "hidden", whiteSpace: "nowrap", padding: "5px 0" }}>
        <div style={{ 
            display: "inline-block", 
            animation: `marquee-${direction} ${speed}s linear infinite`, 
            WebkitTextStroke: outline ? `1px ${color}` : "none",
            color: outline ? "transparent" : color,
            fontSize: "clamp(40px, 6vw, 80px)", 
            fontWeight: 900, 
            letterSpacing: "-0.02em" 
        }}>
            {text}{text}{text}{text}
        </div>
    </div>
);
// -----------------------------------------------------------------------------
// NEW MOTION COMPONENTS
// -----------------------------------------------------------------------------

// 1. スクロールに合わせて横に動く文字
// use: <ScrollText text="METAVANIA" direction={1} speed={2} />
const ScrollText = ({ text, direction = 1, speed = 0.5, y = 0, color = "rgba(0,0,0,0.05)" }: ScrollTextProps) => {
  const [offset, setOffset] = useState(0);
  useEffect(() => {
    const handleScroll = () => setOffset(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  return (
    <div style={{
      position: "absolute",
      top: y, // 親要素の上からの位置
      left: "50%", // 画面中央基準
      transform: `translateX(-50%) translateX(${offset * speed * direction}px)`, // スクロール連動
      whiteSpace: "nowrap",
      pointerEvents: "none",
      zIndex: 0
    }}>
      <span style={{
        fontSize: "20vw", // 画面幅の20%という超巨大サイズ
        fontWeight: 900,
        color: color,
        lineHeight: 0.8,
        display: "block"
      }}>
        {text}
      </span>
    </div>
  );
};
// 2. 常にブルブル震えている文字
// use: <VibrateText text="WARNING" />
type VibrateTextProps = {
  text: string;
  color?: string;
  size?: number;
};
const VibrateText = ({ text, color="#FF0055", size=24 }: VibrateTextProps) => (
  <div style={{ display: "inline-block", animation: "vibrate 0.3s linear infinite both", color: color, fontSize: size, fontWeight: 900 }}>
    {text}
    <style>{`
      @keyframes vibrate {
        0% { transform: translate(0); }
        20% { transform: translate(-2px, 2px); }
        40% { transform: translate(-2px, -2px); }
        60% { transform: translate(2px, 2px); }
        80% { transform: translate(2px, -2px); }
        100% { transform: translate(0); }
      }
    `}</style>
  </div>
);

// 3. 回転し続ける円形バッジ
// use: <SpinBadge text="SCROLL DOWN /// " />
    
type SpinBadgeProps = {
  text: string;
};
const SpinBadge = ({ text }: SpinBadgeProps) => (
  <div style={{ animation: "spin-slow 10s linear infinite", width: 100, height: 100, position: "relative" }}>
     <svg viewBox="0 0 100 100" width="100%" height="100%">
        <path id="circlePath" d="M 50, 50 m -35, 0 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0" fill="none" />
        <text fill="#111" fontSize="12" fontWeight="bold">
           <textPath href="#circlePath">{text}{text}</textPath>
        </text>
     </svg>
     <style>{`@keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
  </div>
);
// =============================================================================
// 5. STYLES (CSS)
// =============================================================================

const GlobalStyles = () => (
  <style jsx global>{`
    /* アニメーション定義 */
    @keyframes marquee-left { 0% { transform: translateX(0); } 100% { transform: translateX(-25%); } }
    @keyframes marquee-right { 0% { transform: translateX(-25%); } 100% { transform: translateX(0); } }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

    /* ステッカー画像スタイル */
    .sticker-img {
        position: absolute;
        width: 300px;
        height: 400px;
        background: #fff;
        padding: 15px;
        box-shadow: 10px 10px 20px rgba(0,0,0,0.15);
        transition: transform 0.1s ease-out;
    }
    .tape {
        position: absolute;
        top: -15px;
        left: 30%;
        width: 100px;
        height: 35px;
        background: rgba(255,255,255,0.6);
        border-left: 1px dashed rgba(0,0,0,0.1);
        border-right: 1px dashed rgba(0,0,0,0.1);
        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        transform: rotate(-5deg);
        z-index: 10;
    }

    /* コンセプトカードスタイル */
    .concept-card {
        width: 280px;
        padding: 30px;
        background: #fff;
        border: 4px solid #111;
        box-shadow: 8px 8px 0 rgba(0,0,0,0.1);
        position: relative;
        transition: transform 0.3s;
    }
    .concept-card:hover {
        transform: scale(1.1) rotate(0deg) !important;
        z-index: 10;
        box-shadow: 15px 15px 0 rgba(0,0,0,0.2);
    }

    /* 雑誌風カラム */
    .mag-title {
        color: #fff;
        padding: 5px 15px;
        display: inline-block;
        font-size: 24px;
        font-weight: 900;
        margin-bottom: 20px;
        transform: skewX(-10deg);
    }
    .mag-text {
        font-size: 16px;
        line-height: 2;
        text-align: justify;
    }
    .highlight.yellow {
        background: linear-gradient(transparent 60%, #FFaa00 60%);
    }

    /* CTAボタン */
    .cta-button {
        padding: 20px 50px;
        font-size: 18px;
        font-weight: 900;
        text-decoration: none;
        border-radius: 50px;
        transition: 0.3s;
        cursor: pointer;
    }
    .cta-button.primary {
        background: #FF0055;
        color: #fff;
        border: 4px solid #FF0055;
        box-shadow: 0 10px 20px rgba(255, 0, 85, 0.4);
    }
    .cta-button.primary:hover {
        transform: translateY(-5px);
        box-shadow: 0 15px 30px rgba(255, 0, 85, 0.6);
    }
    .cta-button.secondary {
        background: transparent;
        color: #111;
        border: 4px solid #111;
    }
    .cta-button.secondary:hover {
        background: #111;
        color: #fff;
    }

    /* 文字選択色 */
    ::selection {
        background: #FF0055;
        color: #fff;
    }
  `}</style>
);