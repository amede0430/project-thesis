import random
import numpy as np
import pandas as pd
from pathlib import Path
from scipy import signal as scipy_signal
from dataclasses import dataclass
from typing import List, Optional

@dataclass
class Segment:
    samples: np.ndarray
    values: np.ndarray
    fs: float
    file_path: Path
    start_idx: int
    end_idx: int

class SignalStream:
    def __init__(self, data_dir: Path):
        self.data_dir = data_dir
        self.files = self._discover_files()
        self.current_df: Optional[pd.DataFrame] = None
        self.current_file: Optional[Path] = None
        self.fs: float = 51200.0
        self.segment_seconds = 0.2  # Réduire à 0.2 seconde
        self.segment_overlap = 0.5
        self.window_samples = int(self.segment_seconds * self.fs)
        self.hop_samples = max(1, int(self.window_samples * (1.0 - self.segment_overlap)))
        self.current_index = 0
        self._select_new_file()

    def _discover_files(self) -> List[Path]:
        files = []
        for csv_file in self.data_dir.rglob("*.csv"):
            if "Accelerometer/Branched" in str(csv_file.parent):
                files.append(csv_file)
        return files

    def _select_new_file(self):
        if not self.files:
            raise FileNotFoundError(f"Aucun fichier CSV trouvé sous {self.data_dir}")
        
        self.current_file = random.choice(self.files)
        df = pd.read_csv(self.current_file)
        
        if df.empty:
            self._select_new_file()
            return
            
        self.current_df = df
        
        # Trouver la colonne de valeurs (priorité à 'Value')
        if 'Value' in df.columns:
            self.value_column = 'Value'
        elif 'value' in df.columns:
            self.value_column = 'value'
        else:
            numeric_cols = df.select_dtypes(include=[np.number]).columns
            if len(numeric_cols) == 0:
                self._select_new_file()
                return
            # Prendre la dernière colonne numérique (pas Sample)
            self.value_column = numeric_cols[-1]
        self.signal_values = df[self.value_column].astype(float).to_numpy()
        
        # Créer les échantillons temporels
        self.time_values = np.arange(len(self.signal_values)) / self.fs
        
        self.current_index = 0

    def next_segment(self) -> Segment:
        if self.current_df is None or self.current_index + self.window_samples >= len(self.signal_values):
            self._select_new_file()

        start = self.current_index
        end = start + self.window_samples
        window = self.signal_values[start:end]

        if len(window) < self.window_samples:
            pad = np.zeros(self.window_samples - len(window))
            window = np.concatenate([window, pad])

        samples = self.time_values[start:start + len(window)]
        self.current_index += self.hop_samples

        return Segment(
            samples=samples.copy(),
            values=window.copy(),
            fs=self.fs,
            file_path=self.current_file,
            start_idx=start,
            end_idx=end
        )