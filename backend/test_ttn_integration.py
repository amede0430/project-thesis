#!/usr/bin/env python3
"""
Script de test pour l'intégration TTN
"""

import asyncio
import httpx
import json
from datetime import datetime

async def test_ttn_api():
    """Test de l'API TTN"""
    ttn_url = "https://eu1.cloud.thethings.network/api/v3/as/applications/leak-app-2/packages/storage/uplink_message"
    auth_header = "Bearer NNSXS.2E2HNUMEU2QPCOHEKNVA6HURN6P45TLHRG7P7JI.NW2H43MJGITAJW4XM6CJCFJTRR2MXGRAFSFXNXDE4WFVW7TNI6BA"
    
    print("🔄 Test de l'API TTN...")
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(
                ttn_url,
                headers={
                    "Authorization": auth_header,
                    "Accept": "application/json"
                },
                params={"last": "1h"}
            )
            
            print(f"📡 Statut HTTP: {response.status_code}")
            
            if response.status_code == 200:
                try:
                    data = response.json()
                    print(f"✅ Données reçues: {len(data) if isinstance(data, list) else 1} messages")
                    
                    # Afficher le premier message pour debug
                    if isinstance(data, list) and len(data) > 0:
                        first_msg = data[0]
                        print(f"📄 Premier message:")
                        print(f"   - Timestamp: {first_msg.get('received_at', 'N/A')}")
                        print(f"   - Payload: {first_msg.get('uplink_message', {}).get('decoded_payload', 'N/A')}")
                    elif isinstance(data, dict):
                        print(f"📄 Message unique:")
                        print(f"   - Timestamp: {data.get('received_at', 'N/A')}")
                        print(f"   - Payload: {data.get('uplink_message', {}).get('decoded_payload', 'N/A')}")
                    
                    return True
                    
                except json.JSONDecodeError:
                    print("⚠️ Réponse non-JSON, contenu:")
                    print(response.text[:500])
                    return False
            else:
                print(f"❌ Erreur API: {response.status_code}")
                print(f"   Réponse: {response.text[:200]}")
                return False
                
    except Exception as e:
        print(f"❌ Erreur de connexion: {e}")
        return False

async def test_local_api():
    """Test de l'API locale"""
    print("\n🔄 Test de l'API locale...")
    
    try:
        async with httpx.AsyncClient() as client:
            # Test du statut TTN
            response = await client.get("http://localhost:8000/ttn/status")
            if response.status_code == 200:
                status = response.json()
                print(f"✅ API locale accessible")
                print(f"   - TTN running: {status.get('is_running', False)}")
                print(f"   - Buffer size: {status.get('buffer_size', 0)}")
            else:
                print(f"❌ API locale inaccessible: {response.status_code}")
                
    except Exception as e:
        print(f"❌ Erreur API locale: {e}")

async def main():
    print("🧪 Test d'intégration TTN AquaGuard\n")
    
    # Test 1: API TTN
    ttn_success = await test_ttn_api()
    
    # Test 2: API locale (si le serveur tourne)
    await test_local_api()
    
    print(f"\n📊 Résumé:")
    print(f"   - TTN API: {'✅ OK' if ttn_success else '❌ Échec'}")
    print(f"   - Fréquence: 0.1 Hz (10s)")
    print(f"   - Points pour analyse: ~60 (10 minutes)")
    
    if ttn_success:
        print(f"\n🎯 Prochaines étapes:")
        print(f"   1. Démarrer le backend: python run.py")
        print(f"   2. Aller sur /monitoring")
        print(f"   3. Voir les données TTN en temps réel")

if __name__ == "__main__":
    asyncio.run(main())