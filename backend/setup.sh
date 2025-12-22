#!/bin/bash

# Créer environnement virtuel
python3 -m venv venv

# Activer l'environnement
source venv/bin/activate

# Installer les dépendances
pip install -r requirements.txt

# Créer l'utilisateur admin
python create_admin.py

echo "Setup terminé ! Pour démarrer le serveur :"
echo "source venv/bin/activate"
echo "python run.py"