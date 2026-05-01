# AI_CONTEXT

## 目的 (Purpose)
このファイルは、プロジェクト（`nabla`）における作業内容、文脈、設計の決定事項を記録するためのログファイルです。
Zedなどの異なるエディタや、別セッションのAIアシスタントがこのプロジェクトの文脈を完全に後追い（再現・把握）できるようにすることを目的とします。

## プロジェクト状態 (Current Status)
- プロジェクト名: nabla
- 概要: Pythonで記述されたロケット飛翔シミュレータ `miniQuabla` を Rust に移植し、さらにデスクトップGUIを搭載したプロジェクト。
- 現在のフェーズ: GUI (Tauri + Next.js) 実装完了・マルチプラットフォーム対応
- アーキテクチャ: Cargo Workspace構成 (`nabla-core`: 計算エンジン, `nabla-cli`: CUI, `nabla-tauri`: GUIアプリ)
- 設定ファイル (Config): TOML形式を標準とし、GUI内のエディタから直接編集可能。外部CSVファイルもGUIから追加可能。
- 実行方法 (Execution): 
  - GUI: `cd nabla-tauri && bun run tauri dev`
  - CUI: `cargo run -p nabla-cli --release -- [設定ファイルのパス]`

## 進行中のタスク (Current Tasks)
- [x] AI作業ログ用ファイル（`AI_CONTEXT.md`）の作成
- [x] プロジェクト内の既存ファイルの確認と現状把握 (`miniQuabla` の取得と調査)
- [x] Rustへの移植方針の決定・モジュール構成の検討
- [x] パラメータ関連モジュールのRust移植 (`aerodynamic`, `engine`, `geometry`, `atmosphere`, `wind`, `launcher`, `payload`, `parachute`)
- [x] パラメータ統合処理のRust移植 (`parameter.rs`)
- [x] ダイナミクス（`dynamics.rs`）のRust移植 (6DOFおよび3DOF運動方程式)
- [x] ソルバー（`solver.rs`）とシミュレーションループの構築
- [x] ポストプロセス・結果出力機能の実装
- [x] 設定ファイルのTOML形式への対応と自動判別
- [x] コードの整理・最適化 (Clippy, fmt)
- [x] README.md と LICENSE の作成
- [x] プロジェクトのWorkspace化 (`nabla-core`, `nabla-cli`, `nabla-tauri`)
- [x] Tauri + Next.js (Bun) によるGUIベースアプリの構築
- [x] UIデザインの刷新 (shadcn/ui, Tailwind CSS v4, ダークモード対応)
- [x] GUI での設定ファイル (TOML) 編集・外部ファイル (CSV) アップロード機能
- [x] OSネイティブダイアログを利用した結果のZIPダウンロード機能
- [x] Leafletによるインタラクティブなフライトマップの表示機能
  - 軌跡・分散ヒートマップポリゴンの描画
  - 動的な凡例 (Legend) とツールチップ
  - 保安範囲 (SafetyArea) の設定追加とマップ上へのポリゴン描画
  - マップのスクリーンショット保存機能
- [x] マルチプラットフォーム向けアプリアイコンの自動生成

## 決定事項 (Decisions)
- **ログの運用**: AIによるコード修正や調査を行う際は、このファイルにステップや意図を記録し、他のツールからでも文脈が追えるようにする。
- **変更の透明性**: コードを変更する前には「なぜその修正が必要か」「どのファイルをどう変えるか」をこのファイルに明記してから作業を行う。
- **GUIアーキテクチャ**: 計算エンジンをWebサービスや他のUIに流用しやすくするため、既存ロジックを `nabla-core` クレートに分離し、GUIアプリは Tauri を用いて `nabla-tauri` として構築する。
- **フロントエンド技術**: 開発効率とパフォーマンスのため、Next.js (SSG) + Tailwind CSS (shadcn/ui) を採用。パッケージマネージャは高速な `bun` を使用する。
- **マップ表示手法**: Leaflet (`react-leaflet`) と `@tmcw/togeojson` を使用。KMLデータをRustから受け取り、フロントエンドで動的にパース・描画・色付けを行う。

## 作業ログ (Changelog)

### 初期セットアップ
- プロジェクトルートに `AI_CONTEXT.md` を新規作成。
- 複数の環境（Zedなど）やAIアシスタント間で文脈をシームレスに引き継ぐための基本方針を決定。

### miniQuablaの取得と調査
- `.gitignore` に `/miniQuabla` を追加。
- GitHubから対象となるリポジトリ (`hotegg-main/miniQuabla`) をプロジェクト内にクローン。
- `README.md` および主要なコード (`simulator.py`, `solver.py`, `dynamics.py`) を確認。
- `scipy.integrate.solve_ivp` や `numpy`, `quaternion` 等を使用したロケットの飛翔シミュレータであることを把握。

### パラメータ関連モジュールの移植
- `Cargo.toml` に依存関係 (`csv`, `nalgebra`, `serde`, `anyhow`, `ode_solvers`) を追加。
- `src/lib.rs` を作成し、モジュール構成の骨組みを定義。
- Pythonコードの `Parameter` ディレクトリ内にある各種クラスを個別のRustモジュール（`aerodynamic.rs`, `engine.rs`, `geometry.rs`, `atmosphere.rs`, `wind.rs`, `launcher.rs`, `payload.rs`, `parachute.rs`）として移植。
- CSV読み込みや1次元補間（`interpolate1d`）、標準大気モデルの計算ロジックなどをRustで実装し、`cargo check` が通る状態まで完了。

### パラメータ統合モジュールの移植
- `src/parameter.rs` を作成し、`miniQuabla/Parameter/parameter.py` 相当の機能（CSVからの諸元読み込み・分類、JSONを介した構造体へのデシリアライズ、各種モジュールの初期化と統括）を実装。
- `get_initial_param` や `get_wind_array` などのヘルパー関数も実装し、初期状態（位置、速度、姿勢、角速度、質量）や分散計算用パラメータを取り出せるようにした。

### ダイナミクスモジュールの移植
- `src/dynamics.rs` を作成し、`miniQuabla/dynamics.py` 相当の機能（飛翔中の6自由度運動方程式およびパラシュート降下時の3自由度運動方程式）を実装。
- `nalgebra` のベクトル・行列・クォータニオン演算を活用し、空気力・減衰モーメント・ジャイロモーメントなどのヘルパー関数も全てRustに移植完了。

### ソルバー・シミュレーション実行の移植と動作確認
- `src/solver.rs` を作成し、ルンゲ＝クッタ法(RK4)を用いた常微分方程式ソルバーを実装（弾道飛行・パラシュート降下の両フェーズ対応）。
- `src/main.rs` を作成し、パラメータ読み込みから軌道計算・結果出力までの一連のシミュレーションループを構築。
- 設定ファイルパスのディレクトリ補正を `parameter.rs` に追加し、`cargo run --release` にてシミュレータが正常に動作することを確認。到達高度や着地距離の算出に成功し、計算時間の劇的な高速化（約22ms）を達成。

### ポストプロセス機能の移植と全体完成
- `src/post_process.rs` を実装し、NED-LLH座標変換機能およびKML・CSV出力機能を移植。
- `main.rs` に出力関数の呼び出しを追加し、軌道ログ・パラシュート降下ログ、Google Earth等で可視化できるKMLファイルの出力を実現。
- これによりPython版 `miniQuabla` のRustへのフルスクラッチ移植（`nabla`）が一旦完了。シミュレーションの精度を保ちつつ、実行速度の大幅な向上に成功。
- さらに `rayon` を導入し、モンテカルロ法による落下分散（Loop）計算を並列化。`cargo run --release -- --loop` で実行でき、56条件の分散計算を約1秒で処理できるようにした。
- 分散計算時の出力形式をPython版と同一に合わせ、同一風速の着地点をポリゴンとして結ぶ `land_map_trajectory.kml` および `land_map_parachute.kml` を出力するように修正。

### TOML形式の設定ファイル対応
- `toml` クレートを導入し、`parameter.rs` にて設定ファイルの拡張子が `.toml` の場合に自動でTOMLとしてパースする機能を実装。
- 従来のCSV形式のConfigファイルとTOML形式のConfigファイルの両方から同様にパラメータを読み込めるように（自動判別で）修正。
- `main.rs` において、コマンドライン引数から設定ファイルのパスを指定できるように改善（未指定時は従来のCSVをフォールバックとして使用）。

### 不要ファイルの削除
- 初期設計時にテスト作成したものの、以降の移植作業で不要となった `src/simulation.rs` を削除し、プロジェクトツリーを整理。

### コードの整理・最適化
- `cargo clippy` の警告を解消（不要な `match` の `matches!` への置き換えや、ネストされた `if` の平滑化など）。
- `cargo fmt` を実行し、コードのフォーマットを整形して可読性を向上。

### READMEとライセンスの整備
- 元の `miniQuabla` のMITライセンス化予定に合わせ、本プロジェクト（`nabla`）にもMITライセンス（`LICENSE`）を適用し、`Cargo.toml` にライセンス情報を記載。
- プロジェクトの概要、特徴、インストール方法、使い方をまとめた `README.md` を作成。

### プロジェクトのWorkspace構成への移行
- GUI化を見据え、プロジェクトをCargoワークスペースとして再編成。
- `nabla-core` (計算ライブラリ) と `nabla-cli` (コマンドラインアプリ) の2つのクレートに分割。
- `parameter.rs` でのファイルパス解決を、設定ファイルのディレクトリ（`base_dir`）を基準に行うよう修正し、ハードコードされていた `miniQuabla/` へのパス依存を排除。

### デスクトップGUI (Tauri + Next.js) の導入
- ワークスペース内に `nabla-tauri` クレートを追加し、Tauri と Next.js (Bun) を用いたデスクトップアプリのフロントエンドを構築。
- UIフレームワークとして Tailwind CSS v4 と shadcn/ui を導入。ダークモードとシステムテーマ切り替えに対応したモダンなカード型レイアウトを構築。

### GUI機能の実装と強化
- **Config Editor**: TOML形式の設定を画面上で直接編集できるテキストエリアを実装。
- **外部ファイル連携**: 画面から `thrust_example.csv` などのCSVファイルをアップロードし、一時ディレクトリに展開してRustコアで利用可能にする機能を実装。
- **実行・ZIP保存機能**: Rust側でシミュレーションを実行後、生成されたログ・KMLファイルをオンメモリでZIP圧縮。Tauriの `dialog` および `fs` プラグインを用いて、OSネイティブの「名前を付けて保存」ダイアログ経由でダウンロード可能に。
- **インタラクティヴマップ**: `react-leaflet` と `@tmcw/togeojson` を導入し、KMLをGeoJSONに変換して衛星写真マップ上に表示。
  - 軌道（Trajectory）は寒色系、パラシュート（Parachute）は暖色系のグラデーション（風速に応じたヒートマップ）でポリゴンを描画するようRustのKML生成ロジックを改修。
  - 描画順序の最適化、レイヤーコントロールによる表示切り替え、動的な凡例（Legend）の追加を実装。
  - TOML設定に `[SafetyArea]` セクションを追加し、指定された座標配列を黒色・半透明のポリゴンとしてマップ上に重畳表示する機能を追加。
  - 射点（Launch point）の赤丸表示を実装。
  - `html-to-image` を用いたマップのスクリーンショット保存機能を実装。
- アプリ名（`Nabla`）の統一と、Tauri CLI (`bunx tauri icon`) によるマルチプラットフォーム向けアプリアイコンの自動生成を完了。
