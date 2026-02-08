#!/usr/bin/env python3
"""Script pour inspecter le modèle ML"""

from tensorflow import keras
import numpy as np

MODEL_PATH = "transfer_learning_adxl345_model.h5"

print("="*80)
print("🔍 INSPECTION DU MODÈLE ML")
print("="*80)

# Charger le modèle
model = keras.models.load_model(MODEL_PATH)
print(f"\n✅ Modèle chargé: {MODEL_PATH}\n")

# Afficher l'architecture
print("📐 ARCHITECTURE DU MODÈLE:")
print("-"*80)
model.summary()

print("\n" + "="*80)
print("📊 DÉTAILS DES COUCHES:")
print("="*80)

for i, layer in enumerate(model.layers):
    print(f"\nCouche {i}: {layer.name}")
    print(f"  Type: {layer.__class__.__name__}")
    print(f"  Config: {layer.get_config()}")
    if hasattr(layer, 'input_shape'):
        print(f"  Input shape: {layer.input_shape}")
    if hasattr(layer, 'output_shape'):
        print(f"  Output shape: {layer.output_shape}")

print("\n" + "="*80)
print("🧪 TEST AVEC DONNÉES ALÉATOIRES:")
print("="*80)

# Test avec des données aléatoires
test_input = np.random.rand(1, 224, 224, 1).astype(np.float32)
print(f"\nInput shape: {test_input.shape}")
print(f"Input range: [{test_input.min():.3f}, {test_input.max():.3f}]")

predictions = model.predict(test_input, verbose=0)
print(f"\nOutput shape: {predictions.shape}")
print(f"Output values: {predictions[0]}")
print(f"Output range: [{predictions.min():.6f}, {predictions.max():.6f}]")

# Test avec des données nulles
test_zeros = np.zeros((1, 224, 224, 1), dtype=np.float32)
predictions_zeros = model.predict(test_zeros, verbose=0)
print(f"\n🔹 Test avec zéros:")
print(f"   Output: {predictions_zeros[0]}")

# Test avec des données à 1
test_ones = np.ones((1, 224, 224, 1), dtype=np.float32)
predictions_ones = model.predict(test_ones, verbose=0)
print(f"\n🔹 Test avec uns:")
print(f"   Output: {predictions_ones[0]}")

print("\n" + "="*80)
