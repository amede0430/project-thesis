import json
import os
import pandas as pd
import random
from pathlib import Path
from typing import Dict, List, Optional, Tuple
from .spectrogram_service import SpectrogramService

class DatasetService:
    def __init__(self):
        self.config_path = Path(__file__).parent.parent.parent / "dataset" / "config.json"
        self.config = self._load_config()
        
    def _load_config(self) -> Dict:
        with open(self.config_path, 'r') as f:
            return json.load(f)
    
    def _save_config(self):
        with open(self.config_path, 'w') as f:
            json.dump(self.config, f, indent=2)
    
    def get_sensor_files(self, sensor_id: str) -> Dict:
        """Récupère les fichiers associés à un capteur"""
        return self.config["sensor_assignments"].get(str(sensor_id), {})
    
    def assign_files_to_sensor(self, sensor_id: str, normal_files: List[str], leak_files: List[str], network_type: str):
        """Assigne des fichiers à un capteur"""
        self.config["sensor_assignments"][str(sensor_id)] = {
            "network_type": network_type,
            "normal_files": normal_files,
            "leak_files": leak_files,
            "current_file": None,
            "current_segment": 0,
            "leak_mode": False
        }
        self._save_config()
    
    def get_next_segment(self, sensor_id: str) -> Optional[Dict]:
        """Récupère le prochain segment de 5s avec spectrogramme pour un capteur"""
        sensor_config = self.config["sensor_assignments"].get(str(sensor_id))
        if not sensor_config:
            return None
            
        # Sélectionner le bon type de fichiers
        files = sensor_config["leak_files"] if sensor_config["leak_mode"] else sensor_config["normal_files"]
        
        # Si pas de fichier actuel, en choisir un aléatoirement
        if not sensor_config["current_file"]:
            sensor_config["current_file"] = random.choice(files)
            sensor_config["current_segment"] = 0
        
        # Charger le fichier CSV
        file_path = self._get_file_path(sensor_config["network_type"], sensor_config["current_file"], sensor_config["leak_mode"])
        
        try:
            df = pd.read_csv(file_path)
            
            # Calculer les indices pour le segment de 5s
            total_rows = len(df)
            segment_size = total_rows // 6  # 6 segments de 5s dans 30s
            start_idx = sensor_config["current_segment"] * segment_size
            end_idx = min(start_idx + segment_size, total_rows)
            
            segment_data = df.iloc[start_idx:end_idx]
            
            # Générer spectrogramme et caractéristiques
            spectrogram_data = SpectrogramService.generate_spectrogram(segment_data)
            features = SpectrogramService.extract_features(segment_data)
            
            # Passer au segment suivant
            sensor_config["current_segment"] += 1
            
            # Si fin du fichier, choisir un nouveau fichier
            if sensor_config["current_segment"] >= 6:
                sensor_config["current_file"] = random.choice(files)
                sensor_config["current_segment"] = 0
            
            self._save_config()
            
            return {
                "sensor_id": sensor_id,
                "signal_data": segment_data.to_dict('records'),
                "spectrogram": spectrogram_data,
                "features": features,
                "is_leak": sensor_config["leak_mode"],
                "file_name": sensor_config["current_file"],
                "segment": sensor_config["current_segment"] - 1
            }
            
        except Exception as e:
            print(f"Erreur lecture fichier {file_path}: {e}")
            return None
    
    def _get_file_path(self, network_type: str, filename: str, is_leak: bool) -> Path:
        """Construit le chemin complet vers un fichier CSV"""
        base_path = Path(__file__).parent.parent.parent
        
        if is_leak:
            if "GL_" in filename:  # Gasket Leak
                folder = self.config["dataset_paths"][network_type]["gasket_leak"]
            elif "CC_" in filename:  # Circumferential Crack
                folder = self.config["dataset_paths"][network_type]["circumferential_crack"]
            elif "LC_" in filename:  # Longitudinal Crack
                folder = self.config["dataset_paths"][network_type]["longitudinal_crack"]
            elif "OL_" in filename:  # Orifice Leak
                folder = self.config["dataset_paths"][network_type]["orifice_leak"]
            else:
                folder = self.config["dataset_paths"][network_type]["gasket_leak"]
        else:
            folder = self.config["dataset_paths"][network_type]["normal"]
        
        return base_path / folder / filename
    
    def toggle_leak_mode(self, sensor_id: str, leak_mode: bool):
        """Active/désactive le mode fuite pour un capteur"""
        if str(sensor_id) in self.config["sensor_assignments"]:
            self.config["sensor_assignments"][str(sensor_id)]["leak_mode"] = leak_mode
            # Reset le fichier actuel pour changer immédiatement
            self.config["sensor_assignments"][str(sensor_id)]["current_file"] = None
            self._save_config()
    
    def get_available_files(self) -> Dict:
        """Liste tous les fichiers disponibles par type de réseau"""
        available_files = {"branched": {"normal": [], "leak": []}, "looped": {"normal": [], "leak": []}}
        
        for network_type in ["branched", "looped"]:
            # Fichiers normaux
            normal_path = Path(__file__).parent.parent.parent / self.config["dataset_paths"][network_type]["normal"]
            if normal_path.exists():
                available_files[network_type]["normal"] = [f.name for f in normal_path.glob("*.csv")]
            
            # Fichiers avec fuites
            for leak_type in ["gasket_leak", "circumferential_crack", "longitudinal_crack", "orifice_leak"]:
                leak_path = Path(__file__).parent.parent.parent / self.config["dataset_paths"][network_type][leak_type]
                if leak_path.exists():
                    available_files[network_type]["leak"].extend([f.name for f in leak_path.glob("*.csv")])
        
        return available_files