# AnonymeForum

Forum anonyme avec architecture microservices déployée sur AWS EC2 via Terraform. Configuration runtime des IPs dynamiques pour éviter le rebuild des images Docker.

## 🏗️ Architecture

4 services containerisés déployés sur des instances EC2 séparées :

- **Sender** (React + Vite) - Port 8080 : Formulaire de création de messages
- **Thread** (React + Vite) - Port 80 : Affichage des messages
- **API** (Node.js + Express) - Port 3000 : Backend REST
- **DB** (PostgreSQL) - Port 5432 : Base de données (privée, VPC uniquement)

## 🚀 Déploiement rapide


### Local

```bash
docker-compose up -d
```

Les services seront accessibles sur :
- Sender : http://localhost:8080
- Thread : http://localhost
- API : http://localhost:3000

### AWS (Production)

```bash
# 1. Push le code → GitHub Actions build automatiquement les images Docker
git push origin test

# 2. Récupérer le SHA du commit (tag des images)
git log -1 --format=%h

# 3. Déployer avec Terraform
cd terraform
terraform apply \
  -var="github_token=ghp_VOTRE_TOKEN" \
  -var="docker_tag=384d6ca" \
  -var="environment=test" \
  -auto-approve

# 4. Récupérer les IPs
terraform output
```

## 🔧 IPs Dynamiques - La solution

### Le problème

Les applications React/Vite compilent les variables d'environnement **au build**. Résultat : les IPs sont hardcodées dans les images Docker, impossible de les changer sans rebuild.

### La solution

**Configuration runtime** via `config.js` injecté dynamiquement :

#### 1. Fichier `public/config.js` (chargé au runtime)

```javascript
// sender/public/config.js
window.ENV_CONFIG = {
  VITE_API_URL: 'http://localhost:3000',
  VITE_THREAD_URL: 'http://localhost'
};
```

#### 2. Code TypeScript lit `window.ENV_CONFIG`

```typescript
// src/services/api.ts
const API_BASE = (window.ENV_CONFIG?.VITE_API_URL || 
                  import.meta.env.VITE_API_URL || 
                  'http://localhost:3000') as string;
```

#### 3. Terraform injecte les vraies IPs dans les containers

```hcl
# terraform/ec2.tf
provisioner "remote-exec" {
  inline = [
    "docker exec forum-sender-test sh -c \"echo 'window.ENV_CONFIG = { VITE_API_URL: \\\"http://${aws_instance.api.public_ip}:3000\\\", VITE_THREAD_URL: \\\"http://${aws_instance.thread.public_ip}\\\" };' > /usr/share/nginx/html/config.js\""
  ]
}
```

### Résultat

✅ **Images Docker génériques** (pas d'IPs hardcodées)  
✅ **Pas de rebuild nécessaire** pour changer les IPs  
✅ **IPs vraiment dynamiques** injectées par Terraform  
✅ **Fallback automatique** sur localhost en dev  

## � CI/CD

**GitHub Actions** (`.github/workflows/docker-build.yml`) :

1. **Trigger** : À chaque `git push`
2. **Build** : 3 images Docker (API, Sender, Thread)
3. **Tests** : Jest (API) + Vitest (Thread) + ESLint
4. **Tag** : Avec le SHA du commit (`git log -1 --format=%h`)
5. **Push** : Sur GitHub Container Registry (`ghcr.io/pauldebril/anonymeforum-{service}:{tag}`)

**Terraform** déploie ensuite ces images sur AWS EC2.

## 🛠️ Stack technique

- **Frontend** : React 19, TypeScript 5.7, Vite 6, TailwindCSS 4.1
- **Backend** : Node.js 18, Express 5.1, PostgreSQL 15
- **Infrastructure** : Terraform 1.13, Docker, AWS EC2, GitHub Actions

## 📝 Endpoints API

- `GET /hello` - Bienvenue
- `GET /health` - Health check
- `GET /messages` - Liste des messages
- `POST /messages` - Créer un message (`{ pseudo, contenu }`)

## 🐛 Troubleshooting

### Les liens pointent vers localhost

```bash
# Vérifier l'injection des IPs
curl http://<SENDER_IP>:8080/config.js
curl http://<THREAD_IP>/config.js

# Re-injecter si besoin
cd terraform
terraform taint null_resource.update_sender_config
terraform taint null_resource.update_thread_config
terraform apply -var="github_token=..." -var="docker_tag=..." -var="environment=test" -auto-approve
```

### Détruire l'infrastructure

```bash
cd terraform
terraform destroy \
  -var="github_token=ghp_VOTRE_TOKEN" \
  -var="docker_tag=384d6ca" \
  -var="environment=test" \
  -auto-approve
```

##  Auteur

**Paul Debril** - [@PaulDebril](https://github.com/PaulDebril)
