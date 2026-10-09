"""
Train a simple Logistic Regression model on the UCI Heart Disease (Cleveland) dataset.

    python training/train_model.py                 # downloads the dataset if data/heart.csv is missing
    python training/train_model.py --data my.csv   # use your own CSV with the same columns

Workflow: load -> clean -> select features -> train/test split -> tune C with CV -> evaluate -> save.
All metrics are computed from data and are never hardcoded.
"""
import argparse
import json
import sys
import urllib.request
from pathlib import Path

import joblib
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, f1_score, precision_score, recall_score, roc_auc_score
from sklearn.model_selection import GridSearchCV, StratifiedKFold, cross_validate, train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

ROOT = Path(__file__).resolve().parent.parent
DATA_PATH = ROOT / "data" / "heart.csv"
MODEL_PATH = ROOT / "model" / "heart_model.joblib"
METRICS_PATH = ROOT / "model" / "metrics.json"

# Source: UCI Machine Learning Repository - Heart Disease (processed Cleveland data, 303 rows)
DATASET_URL = "https://archive.ics.uci.edu/ml/machine-learning-databases/heart-disease/processed.cleveland.data"
RAW_COLUMNS = ["age", "sex", "cp", "trestbps", "chol", "fbs", "restecg", "thalach",
               "exang", "oldpeak", "slope", "ca", "thal", "num"]

# Only features a user can reasonably enter in the web form.
NUMERIC = ["age", "trestbps", "chol", "thalach"]
BINARY = ["sex", "fbs", "exang"]
CATEGORICAL = ["cp"]  # 1 typical, 2 atypical, 3 non-anginal, 4 asymptomatic
FEATURES = NUMERIC + BINARY + CATEGORICAL


def load_dataset(path: Path) -> pd.DataFrame:
    if not path.exists():
        print(f"Downloading dataset from {DATASET_URL}")
        path.parent.mkdir(parents=True, exist_ok=True)
        try:
            with urllib.request.urlopen(DATASET_URL, timeout=60) as r:
                raw = r.read().decode("utf-8")
        except Exception as exc:  # noqa: BLE001
            sys.exit(f"Could not download the dataset ({exc}).\n"
                     f"Download it manually from {DATASET_URL} and save as {path} with header: {','.join(RAW_COLUMNS)}")
        rows = [line for line in raw.strip().splitlines() if line.strip()]
        path.write_text(",".join(RAW_COLUMNS) + "\n" + "\n".join(rows) + "\n")
    return pd.read_csv(path, na_values="?")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--data", type=Path, default=DATA_PATH)
    args = parser.parse_args()

    df = load_dataset(args.data)
    print(f"Loaded {len(df)} rows")

    # Clean: keep needed columns, drop rows missing any of them, binarise target (0 = no disease, 1-4 = disease)
    df = df[FEATURES + ["num"]].dropna().copy()
    df["target"] = (df["num"] > 0).astype(int)
    X, y = df[FEATURES], df["target"]
    print(f"Using {len(df)} complete rows | positive class share: {y.mean():.2%}")

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

    pre = ColumnTransformer([
        ("num", StandardScaler(), NUMERIC),
        ("cat", OneHotEncoder(handle_unknown="ignore"), CATEGORICAL),
        ("bin", "passthrough", BINARY),
    ])
    pipe = Pipeline([("pre", pre), ("clf", LogisticRegression(max_iter=1000))])

    # Tune regularisation strength with 5-fold CV on the training split only (no test-set leakage)
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    search = GridSearchCV(pipe, {"clf__C": [0.01, 0.03, 0.1, 0.3, 1, 3, 10]}, scoring="roc_auc", cv=cv)
    search.fit(X_train, y_train)
    model = search.best_estimator_
    print(f"Best regularisation C = {search.best_params_['clf__C']}")

    pred = model.predict(X_test)
    proba = model.predict_proba(X_test)[:, 1]
    # With ~300 rows the 20% test split is tiny, so also report 5-fold CV over ALL rows (more stable estimate)
    cvr = cross_validate(model, X, y, cv=cv, scoring=["accuracy", "precision", "recall", "f1", "roc_auc"])
    metrics = {
        "accuracy": accuracy_score(y_test, pred),
        "precision": precision_score(y_test, pred, zero_division=0),
        "recall": recall_score(y_test, pred, zero_division=0),
        "f1": f1_score(y_test, pred, zero_division=0),
        "roc_auc": roc_auc_score(y_test, proba),
        "cv_5fold": {k: float(cvr[f"test_{k}"].mean()) for k in ["accuracy", "precision", "recall", "f1", "roc_auc"]},
        "best_C": search.best_params_["clf__C"],
        "train_rows": int(len(X_train)),
        "test_rows": int(len(X_test)),
        "features": FEATURES,
        "dataset": "UCI Heart Disease (Cleveland)",
    }
    print("\nHeld-out test set")
    for k in ["accuracy", "precision", "recall", "f1", "roc_auc"]:
        print(f"  {k:<10}: {metrics[k]:.3f}")
    print("\n5-fold cross-validation (all rows, mean)")
    for k, v in metrics["cv_5fold"].items():
        print(f"  {k:<10}: {v:.3f}")

    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, MODEL_PATH)
    METRICS_PATH.write_text(json.dumps(metrics, indent=2))
    print(f"\nSaved model -> {MODEL_PATH}")


if __name__ == "__main__":
    main()