# AI_CONTEXT

## 目的 (Purpose)
このファイルは、プロジェクト（`nabla`）における作業内容、文脈、設計の決定事項を記録するためのログファイルです。
異なるエディタや、別セッションのAIアシスタントがこのプロジェクトの文脈を完全に後追い（再現・把握）できるようにすることを目的とします。

## プロジェクト状態 (Current Status)
- プロジェクト名: Nabla Simulator
- 概要: Pythonで記述されたロケット飛翔シミュレータ `miniQuabla` を Rust に移植し、さらにデスクトップGUIを搭載したプロジェクト。
- 現在のフェーズ: GUI (Tauri + Next.js) 実装完了・マルチプラットフォーム対応完了。
- アーキテクチャ: Cargo Workspace構成 (`nabla-core`: 計算エンジン, `nabla-cli`: CUI, `nabla-tauri`: デスクトップGUIアプリ, `nabla-server`: Web APIサーバー)
- 設定ファイル (Config): TOML形式を標準とし、GUI内のエディタから直接編集可能。またローカルの `.toml` ファイルや `.csv` ファイルをGUIから読み込み・アップロード可能。
- 実行方法 (Execution): 
  - GUI: `cd nabla-tauri && bun run tauri dev`
  - CUI: `cargo run -p nabla-cli --release -- [設定ファイルのパス]`
  - API Server: `cd nabla-server && cargo run --release`

## 完了した主要タスク (Completed Tasks)
- [x] AI作業ログ用ファイルの作成および文脈の記録
- [x] Python版 `miniQuabla` のRustへのフルスクラッチ移植（物理モデル、ソルバー、CSV/TOML読み込み、KML/CSV出力）
- [x] プロジェクトのWorkspace化 (`nabla-core`, `nabla-cli`, `nabla-tauri`, `nabla-server` への分離)
- [x] Web APIサーバー (`nabla-server`) の構築 (Axum + Tokio)
  - [x] `multipart/form-data` によるシミュレーション設定・外部ファイルのアップロード受付機能
  - [x] 計算結果のオンメモリZIP圧縮とKMLコンテンツ等のJSONレスポンス返却機能
- [x] Tauri + Next.js (Bun) + Tailwind CSS (shadcn/ui) によるデスクトップGUIアプリの構築
- [x] ダークモードとシステムテーマ切り替えのシームレスな対応
- [x] GUI 上での TOML ファイルの読み込み（Upload TOML）と直接編集機能の実装
- [x] GUI 上での外部CSVファイル（推力データ等）の追加・読み込み機能の実装
- [x] OSネイティブダイアログを利用した計算結果のZIPファイルダウンロード機能
- [x] Leafletを用いたインタラクティブなフライトマップの表示機能
  - [x] 軌跡・分散ヒートマップポリゴンの描画（風速に応じたグラデーションカラー）
  - [x] 動的な凡例 (Legend) とツールチップの追加
  - [x] 射点 (Launch Point) の赤丸マーカー表示
  - [x] 保安範囲 (SafetyArea) の設定追加とマップ上への半透明黒色ポリゴン描画
  - [x] マップのスクリーンショット保存機能（`html-to-image`利用）
- [x] マルチプラットフォーム向けアプリアイコンの自動生成（`app-icon.png`から）とアプリ名の統一（`Nabla`）
- [x] GitHub Actions を用いたマルチプラットフォーム (Windows, macOS, Linux) 向けTauri自動ビルドCIの構築
- [ ] ランディングページ (LP) の作成

## 決定事項 (Decisions)
- **APIサーバーの導入**: Tauri (デスクトップアプリ) に依存せず、純粋なWebブラウザ環境や外部システムからでもシミュレーションを実行できるようにするため、`axum` を用いた `nabla-server` クレートを構築。
- **GUIアーキテクチャ**: 計算エンジンを他のUIにも流用しやすくするため、コアロジックを `nabla-core` に分離し、GUIアプリは Tauri を用いて `nabla-tauri` に構築。
- **フロントエンド技術**: 開発効率・パフォーマンス・デザイン性を高めるため、Next.js (SSG) + Tailwind CSS (v4) + shadcn/ui を採用。パッケージマネージャは高速な `bun` を使用する。
- **ファイルパス解決**: `miniQuabla` 特有のハードコードパスを排除し、指定された `base_dir` からの相対パスで外部CSVファイル等を解決するように統一。
- **マップ表示手法**: Leaflet (`react-leaflet`) と `@tmcw/togeojson` を使用。KMLデータをRustから受け取り、フロントエンドで動的にパース・描画・スタイル適用を行う。
- **スクリーンショット機能**: 最新のCSS(Tailwind v4のoklch等)を解釈させるため、`html2canvas` ではなく `html-to-image` を採用。

## 作業ログ (Changelog)

### 初期セットアップ 〜 Rust移植完了
- `miniQuabla` の取得と調査、依存関係の追加。
- 各種パラメータモジュール、ダイナミクス(6DOF/3DOF)、ソルバー(RK4)、ポストプロセス(KML/CSV出力)をRustに移植。
- Rayonを用いた落下分散(Loop)計算のマルチスレッド並列化、TOML形式設定ファイルへの自動判別対応。

### プロジェクトのWorkspace構成への移行
- GUI化を見据え、プロジェクトをCargoワークスペースとして再編成。
- `nabla-core` (計算ライブラリ) と `nabla-cli` (コマンドラインアプリ) の2つのクレートに分割。
- `parameter.rs` でのファイルパス解決をハードコードから `base_dir` 基準に変更。

### デスクトップGUI (Tauri + Next.js) の導入
- ワークスペース内に `nabla-tauri` クレートを追加し、Tauri と Next.js (Bun) を統合。
- UIフレームワークとして Tailwind CSS v4 と shadcn/ui を導入。ダークモードに対応したモダンなカード型レイアウトを構築。
- アプリ名を「Nabla」に統一し、`app-icon.png` から全プラットフォーム対応のアプリアイコンを `tauri icon` コマンドで生成。

### GUI機能の実装と強化
- **Config Editor**: TOML形式の設定を画面上で直接編集できるテキストエリアを実装。「Upload TOML」ボタンからローカルのTOMLファイルを一発で読み込める機能を追加。
- **外部ファイル連携**: 画面から `thrust_example.csv` などのCSVファイルをアップロード（複数可）し、一時ディレクトリに展開してRustコアで利用可能にする機能を実装。
- **実行・ZIP保存機能**: Rust側でシミュレーションを実行後、生成されたログ・KMLファイルをオンメモリでZIP圧縮。Tauriの `dialog` および `fs` プラグインを用い、OSネイティブの「名前を付けて保存」ダイアログ経由でZIPをダウンロード可能に。

### インタラクティブ・フライトマップ機能の実装
- `react-leaflet` と `togeojson` を導入し、Rustが生成したKMLデータを衛星写真マップ上に投影する `MapViewer` コンポーネントを作成。
- 落下分散のポリゴン描画において、風速に応じたヒートマップカラー (青〜赤) をRust側で動的にKMLに付与。
- マップの描画順序を調整し、巨大なポリゴンが小さなポリゴンを覆い隠さないように改善（内側の塗りつぶしは完全透過とし、枠線のみの描画に）。
- Trajectory(寒色系)とParachute(暖色系)の風速グラデーションを視覚的に解説する動的な凡例(Legend)を右上に追加し、マウスホバーで風速やフェーズを確認できるツールチップを実装。
- `config_example.toml` に `[SafetyArea]` セクションを追加し、指定された15点の座標配列を黒色・半透明のポリゴンとしてマップ上に重畳表示する機能を追加。
- 発射地点 (Launch Point) を赤いドット(🔴)で表示。
- `html-to-image` を用い、現在のフライトマップと凡例を `nabla_map_screenshot_xxx.png` として保存するスクリーンショット機能を実装。

### Web APIサーバー (nabla-server) の導入とWeb公開対応
- `nabla-server` クレートを追加し、AxumとTokioベースのWeb APIサーバーを構築。
- `/api/config/default` (GET) でデフォルト設定をJSONで返し、`/api/simulate` (POST) でマルチパートフォームによる設定ファイル・CSVのアップロードを受け付けるよう実装。
- Rustコアでの計算結果（CSV、KML）をオンメモリでZIP圧縮し、KMLのパース結果や発射地点、安全領域(SafetyArea)とともにJSON経由でクライアントに返却するエンドポイントを作成。
- フロントエンド (Next.js) がブラウザ環境で実行された場合のデフォルトAPI通信先を `https://api.nabla-sim.app` に設定。
- サーバー・Tauri共通のデフォルト設定 (Config) を更新し、Solver名を `example` に、サンプルファイル名を変更、さらに `[SafetyArea]` ブロックをデフォルトで含めるように修正。

### CI/CDおよび今後のタスク
- GitHub Actions を用いて、タグプッシュ時および手動実行時に Windows, macOS, Linux 向けの Tauri アプリを自動ビルドし、GitHub Releases にアップロードするワークフロー (`tauri-build.yml`) を追加。
- Web版公開に向けたランディングページ (LP) の作成を予定。
