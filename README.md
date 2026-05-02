# Nabla Simulator

**Nabla Simulator** は、Pythonで記述されたロケット飛翔シミュレータ [miniQuabla](https://github.com/hotegg-main/miniQuabla) を Rust にフルスクラッチで移植し、さらにモダンな **デスクトップ GUI (Next.js + Tauri)** を搭載したプロジェクトです。

元のシミュレーションの物理モデル（6自由度運動方程式、パラシュートの3自由度降下、USSA1976標準大気モデルなど）と精度を完全に互換しつつ、Rustの強力な並列処理（Rayon）と計算効率を活かし、モンテカルロ法による落下分散ループなどを超高速（1秒未満）で計算します。

## 🚀 特徴

* **モダンなデスクトップ GUI**:
  Tauri と Next.js (React), Tailwind CSS (shadcn/ui) を用いた美しく使いやすいインターフェース。ダークモードやシステムテーマにもシームレスに対応します。
* **インタラクティブなフライトマップ**:
  計算結果のKMLデータを直接パースし、Leafletを用いた衛星写真マップ上にロケットの軌跡や落下分散ポリゴン（風速によるヒートマップカラー）を即座に描画します。保安範囲（Safety Area）のオーバーレイ表示や、マップのスクリーンショット保存機能も備えています。
* **超高速計算**:
  単一条件（Nominal）の計算ならわずか数ミリ秒。数十〜百以上の条件を回す落下分散計算もマルチスレッドで一瞬で完了します。
* **ネイティブ連携とZIPダウンロード**:
  OSネイティブのファイル保存ダイアログを呼び出し、計算結果のCSVログとKMLファイルをボタン一つでZIPファイルとしてローカルに保存可能です。
* **TOML設定と外部CSVファイルのサポート**:
  読み書きしやすいTOML形式での設定に対応。また、推力データや空力係数などの外部CSVファイルをGUIから簡単にアップロードしてシミュレーションに組み込むことができます。

---

## 🛠 動作環境・インストール

開発やビルドには以下のツールチェーンが必要です。

* **Rust** (`cargo`)
* **Bun** (Node.js 互換の高速パッケージマネージャ)
* Tauriのビルドに必要なシステム依存ライブラリ (各OSのTauri公式ドキュメントを参照してください)

### インストール手順

1. リポジトリをクローンします。
   ```bash
   git clone https://github.com/0-terarin-0/nabla.git
   cd nabla
   ```

2. GUIディレクトリに移動し、依存関係をインストールします。
   ```bash
   cd nabla-tauri
   bun install
   ```

---

## 💻 使い方

### GUI アプリの起動（推奨）

Tauri 開発サーバーを起動すると、デスクトップアプリのウィンドウが立ち上がります。

```bash
cd nabla-tauri
bun run tauri dev
```

スタンドアロンの実行可能アプリ（Macの `.app` や Windowsの `.exe` など）としてビルドする場合は以下のコマンドを実行します。

```bash
bun run tauri build
```

### CLI（コマンドライン）での実行

GUIを介さず、バックエンドの Rust コアエンジンを直接叩くことも可能です。

```bash
# Nominal (単一条件) のシミュレーション
cargo run -p nabla-cli --release -- nabla-cli/config/config_example.toml

# Dispersion (分散計算) のシミュレーション
cargo run -p nabla-cli --release -- nabla-cli/config/config_example.toml --loop
```

---

## ⚙️ Config (設定ファイル) について

Nabla Simulator は **TOML 形式** の設定ファイルを使用します。
GUIの左側にあるエディタで直接記述・編集できるほか、ローカルの `.toml` ファイルをアップロードして読み込ませることも可能です。

### 詳細なセクション構成とパラメータ

```toml
[Solver]
name = "example"   # シミュレーション名
dt = 0.01          # 積分ステップ [s]
t_max = 1000.0     # シミュレーション最大時間 [s]

[MonteCarlo]
speed_min = 0.0    # 最小風速 [m/s]
speed_step = 1.0   # 風速の刻み幅 [m/s]
speed_num = 9      # 風速の計算ケース数 (例: 0〜8m/s)
azimuth_min = 45.0 # 風向の初期値 [deg]
azimuth_num = 16   # 風向の分割数 (例: 16方位)

[Launcher]
lat = 34.2852      # 射点緯度 [deg]
lon = 135.09059    # 射点経度 [deg]
height = 90.0      # 射点標高 [m]
mag_dec = 7.4      # 磁気偏角 [deg]
launch_elevation = 85.0 # 発射仰角 [deg]
launch_azimuth = 315.0  # 発射方位角 [deg]
rail_length = 5.0  # ランチャレール長 [m]

[Wind]
wind_speed = 1.0           # 地上風速 [m/s]
wind_azimuth = 0.0         # 風向 [deg]
wind_power_coeff = 4.5     # べき乗則の係数
wind_alt_ref = 2.0         # 風速基準高度 [m]
exist_wind_file = true     # 風速の高度分布ファイルを使用するかどうか
wind_file = "wind_example.csv" # 風速ファイル名

[Geometry]
diameter = 114.0     # 機体直径 [mm]
length = 1320.0      # 機体全長 [mm]
mass_dry = 6.138     # 乾燥質量（推進剤除く）[kg]
lcg_dry = 780.0      # 乾燥重心位置 [mm]
Ij_dry_roll = 0.009  # ロール慣性モーメント [kg*m^2]
Ij_dry_pitch = 1.042 # ピッチ慣性モーメント [kg*m^2]

[Aerodynamics]
lcp = 540.0          # 圧力中心位置 [mm]
CA = 0.41            # 軸方向抵抗係数
CNa = 5.436          # 垂直方向力係数傾斜
Clp = -0.0296        # ロール減衰モーメント係数
Cmq = -2.11          # ピッチ減衰モーメント係数
exsist_lcp_file = false # 以下、マッハ数依存の空力係数ファイルを使用するかどうか
exsist_CA_file = false
exsist_CNa_file = false
lcp_file = ""
CA_file = ""
CNa_file = ""

[Engine]
mass_ox = 0.2739         # 酸化剤質量 [kg]
mass_fuel_bef = 0.38     # 燃焼前燃料質量 [kg]
mass_fuel_aft = 0.352    # 燃焼後燃料質量 [kg]
lcg_ox = 136.5           # 酸化剤重心 [mm]
lcg_fuel = 136.0         # 燃料重心 [mm]
l_tank_cap = 273.0       # タンク長さ [mm]
thrust_file = "thrust_example.csv" # 推力履歴のCSVファイル名

[Parachute]
vel_para_1st = 8.805   # 第1パラシュートの降下速度 [m/s]
exist_2nd_para = false # 2段式パラシュートかどうか
vel_para_2nd = 12.836  # 第2パラシュートの降下速度 [m/s]
2nd_para_timer = false # タイマー開放かどうか
alt_para_2nd = 300.0   # 第2パラシュート開放高度 [m]
time_2nd = 20.0        # 第2パラシュート開放時間 [s]

[Payload]
exist_payload = false  # ペイロード分離の有無
mass_payload = 1.0     # ペイロード質量 [kg]
vel_payload = 11.55    # ペイロード降下速度 [m/s]

[SafetyArea]
# 保安範囲の座標 (緯度, 経度) の配列。マップ上に黒い半透明ポリゴンとして描画されます。
coordinates = [
    [34.285604, 135.093313],
    [34.285698, 135.092503],
    [34.286411, 135.092401],
    [34.286863, 135.091339],
    [34.287492, 135.089311],
    [34.286140, 135.088726],
    [34.286634, 135.087086],
    [34.283611, 135.087193],
    [34.283675, 135.088155],
    [34.283486, 135.088878],
    [34.282289, 135.090412],
    [34.282672, 135.090973],
    [34.282842, 135.091651],
    [34.283453, 135.092365],
    [34.284049, 135.092649]
]
```

### 外部データファイル (CSV) の指定
エンジン推力や空力係数など、時系列やマッハ数で変化するデータは外部の CSV ファイルとして与えることができます。

```toml
[Engine]
thrust_file = "thrust_example.csv"
```

**GUIでの使い方:**
TOML内で上記のようにファイル名（パスではなくファイル名のみ）を指定した上で、GUIの「External Files (CSV)」セクションからその名前と一致するCSVファイルを追加してから Run を押してください。

---

## 📁 出力される結果データ

シミュレーションを実行し保存（ZIPダウンロード）すると、以下のファイルが得られます。

* **`trajectory_log.csv`**: 飛翔中の機体状態（位置、速度、姿勢クォータニオンなど）の時間履歴
* **`parachute_log.csv`**: パラシュート降下中の位置・速度の時間履歴
* **`flight_log.kml`**: 軌道の3Dラインを描画するKMLファイル（Nominal実行時）
* **`land_map_trajectory.kml` / `land_map_parachute.kml`**: 落下分散の着地点を結んだヒートマップポリゴン（Dispersion実行時）

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.