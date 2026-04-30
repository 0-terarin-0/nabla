# nabla

**nabla** は、Pythonで記述されたロケット飛翔シミュレータ [miniQuabla](https://github.com/hotegg-main/miniQuabla) を Rust にフルスクラッチで移植したプロジェクトです。

元のシミュレーションの物理モデル（6自由度運動方程式、パラシュートの3自由度降下、USSA1976標準大気モデルなど）と精度を完全に互換しつつ、Rustの強力な並列処理（Rayon）と計算効率を活かし、実行速度を数十倍〜数百倍にまで引き上げています。

## 特徴

* **超高速計算**:
  単一条件（Nominal）の計算ならわずか数ミリ秒（1000秒分のシミュレーションを約1〜20msで処理）。モンテカルロ法による落下分散ループも、数十〜百以上の条件を1秒未満で計算します。
* **TOML/CSV 自動判別**:
  元の `miniQuabla` で使用されているフラットな `CSV` 形式の設定ファイルをそのまま読み込めるほか、より人間に読みやすく構造化された `TOML` 形式での設定にもネイティブに対応しています。
* **Google Earth / KML 出力**:
  弾道落下、パラシュート降下、分散円（ポリゴン）の各軌道を KML 形式で出力し、Google Earth 等で直接可視化できます。

## 動作環境・インストール

Rust のツールチェーン（`cargo`）がインストールされている必要があります。

```bash
git clone <this_repository>
cd nabla
cargo build --release
```

## 使い方

### 1. 単一条件（Nominal）のシミュレーション

コマンドライン引数に設定ファイルのパスを渡すことで、軌道とパラシュート降下を計算します。
（引数を省略した場合は、デフォルトで `miniQuabla/example/rocket_config.csv` が読み込まれます）

```bash
cargo run --release -- config/nichikagon_config.toml
```

**実行結果の例:**
```text
Loading configuration from config/nichikagon_config.toml ...

Calculating trajectory...
-> Apogee reached: 219.94 m at 7.46 s

Calculating parachute descent...
-> Landed: Distance 86.29 m from launch pad at 32.46 s

--- Simulation Finished ---
Solve ODE (Trajectory) : 1.19ms
Solve ODE (Parachute)  : 236.86µs
Total Calculation Time : 1.42ms
```

### 2. 落下分散（モンテカルロ）シミュレーション

`--loop` オプションを付与することで、設定ファイル内で指定された風速・風向の組み合わせ（分散条件）をすべて並列計算します。

```bash
cargo run --release -- config/nichikagon_config.toml --loop
```

**実行結果の例:**
```text
--- Starting Loop (Dispersion) Simulation ---
Total conditions to compute: 144
Exported dispersion results to land_map_trajectory.kml and land_map_parachute.kml
Loop Simulation Time : 155.25ms
```

## 出力ファイル

計算が完了すると、プロジェクトのルートディレクトリに以下のファイルが生成されます。

* **`trajectory_log.csv`**: 飛翔中の機体状態（位置、速度、姿勢クォータニオンなど）の時間履歴
* **`parachute_log.csv`**: パラシュート降下中の位置・速度の時間履歴
* **`flight_log.kml`**: 軌道の3Dラインを描画するKMLファイル（単一条件実行時）
* **`land_map_trajectory.kml` / `land_map_parachute.kml`**: 落下分散の着地点をポリゴンで結んだKMLファイル（`--loop` 実行時）

## 設定ファイルについて

TOML形式の設定ファイルは、見やすくするために任意のセクション（例：`[Geometry]`, `[Engine]`, `[Parachute]`）に分けて記述することができます。プログラム内部で自動的にフラット化されて読み込まれるため、セクションの名前や分け方は自由に変更可能です。

設定例は `config/nichikagon_config.toml` などを参照してください。

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
（※本家 `miniQuabla` のMITライセンス化を前提として、本移植版も同等のMITライセンス下で公開されます。）