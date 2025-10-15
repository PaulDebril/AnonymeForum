# CI/CD Pipeline Dynamique - AnonymeForum

## 🎯 Objectif accompli

J'ai transformé votre projet en une CI/CD complètement automatisée et dynamique qui :

1. **Récupère automatiquement le tag Docker** du commit
2. **Élimine tous les localhost hardcodés** 
3. **Configure dynamiquement les IPs** des services
4. **Déploie automatiquement** sur un simple push

## 🚀 Workflow complet

### Sur chaque `git push` vers `main` :

1. **Build & Test** des 3 services (api, sender, thread)
2. **Génération du tag Docker** basé sur le commit hash
3. **Push des images** vers GitHub Container Registry
4. **Déploiement Terraform** avec le nouveau tag
5. **Mise à jour automatique** des conteneurs avec les bonnes IPs
6. **Health checks** pour vérifier que tout fonctionne

## 🔧 Variables d'environnement dynamiques

### API Service
- `DB_HOST` → IP privée de l'instance DB (au lieu de localhost)

### Sender Service  
- `VITE_API_URL` → `http://{API_IP}:3000`
- `VITE_THREAD_URL` → `http://{THREAD_IP}`

### Thread Service
- `VITE_API_URL` → `http://{API_IP}:3000`
- `VITE_SENDER_URL` → `http://{SENDER_IP}:8080`

## 📝 Secrets GitHub requis

Assurez-vous d'avoir configuré ces secrets dans votre repo GitHub :

```
GHCR_PAT              # GitHub Personal Access Token
AWS_ACCESS_KEY_ID     # AWS Access Key  
AWS_SECRET_ACCESS_KEY # AWS Secret Key
SSH_PRIVATE_KEY       # Clé privée SSH pour se connecter aux instances
```

## 🎉 Résultat

Plus besoin de :
- ❌ Modifier manuellement les IPs
- ❌ Mettre à jour les tags Docker
- ❌ Se connecter en SSH aux serveurs
- ❌ Redémarrer les services

Maintenant :
- ✅ `git push` → Tout se déploie automatiquement
- ✅ IPs dynamiques gérées automatiquement  
- ✅ Tags Docker basés sur le commit
- ✅ Health checks automatiques
- ✅ Rollback facile si problème

## 🔗 URLs finales

Après chaque déploiement, vous aurez :
- **Sender App** : `http://{SENDER_IP}:8080`
- **Thread App** : `http://{THREAD_IP}`  
- **API** : `http://{API_IP}:3000`
- **API Docs** : `http://{API_IP}:3000/api-docs`

Les URLs exactes sont affichées dans les logs GitHub Actions ! 🎊