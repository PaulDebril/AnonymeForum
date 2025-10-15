# AnonymeForum

Forum anonyme avec architecture microservices déployée sur AWS EC2 via Terraform.

## 📋 Table des matières

- [Architecture](#architecture)
- [Technologies utilisées](#technologies-utilisées)
- [Prérequis](#prérequis)
- [Installation locale](#installation-locale)
- [Déploiement sur AWS](#déploiement-sur-aws)
- [Configuration des IPs dynamiques](#configuration-des-ips-dynamiques)
- [Structure du projet](#structure-du-projet)
- [Workflow CI/CD](#workflow-cicd)
- [Utilisation](#utilisation)
- [Troubleshooting](#troubleshooting)

## 🏗️ Architecture

Le projet est composé de 4 services indépendants :

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   Sender    │      │   Thread    │      │     API     │      │     DB      │
│  (React)    │─────▶│  (React)    │─────▶│  (Node.js)  │─────▶│ (PostgreSQL)│
│  Port 8080  │      │   Port 80   │      │  Port 3000  │      │  Port 5432  │
└─────────────┘      └─────────────┘      └─────────────┘      └─────────────┘
```

### Services

1. **Sender** (Frontend - React + Vite)
   - Formulaire de création de messages
   - Lien vers la page Thread
   - Port : 8080

2. **Thread** (Frontend - React + Vite)
   - Affichage de tous les messages
   - Bouton retour vers Sender
   - Port : 80

3. **API** (Backend - Node.js + Express)
   - Endpoints REST pour les messages
   - Connexion à la base de données
   - Port : 3000

4. **DB** (Base de données - PostgreSQL)
   - Stockage des messages
   - Port : 5432 (privé, accessible uniquement depuis le VPC)

## 🛠️ Technologies utilisées

### Frontend
- **React** 19.0.0
- **TypeScript** 5.7.2
- **Vite** 6.2.0
- **TailwindCSS** 4.1.6
- **Axios** pour les requêtes HTTP

### Backend
- **Node.js** 18
- **Express** 5.1.0
- **pg** (PostgreSQL client) 8.13.1

### Infrastructure
- **Terraform** 1.13.2
- **Docker** pour la containerisation
- **AWS EC2** (instances t2.nano et t2.micro)
- **GitHub Actions** pour le CI/CD
- **GitHub Container Registry** pour stocker les images Docker

### Base de données
- **PostgreSQL** 15

## 📦 Prérequis

### Pour le développement local
- Node.js 18+
- Docker et Docker Compose
- Git

### Pour le déploiement AWS
- Compte AWS avec accès programmatique
- Terraform Cloud (ou Terraform CLI)
- GitHub account avec Actions activé
- GitHub Personal Access Token (avec permissions `read:packages`)

## 🚀 Installation locale

### 1. Cloner le repository

```bash
git clone https://github.com/PaulDebril/AnonymeForum.git
cd AnonymeForum
```

### 2. Lancer avec Docker Compose

```bash
docker-compose up -d
```

Les services seront accessibles sur :
- Sender : http://localhost:8080
- Thread : http://localhost
- API : http://localhost:3000

### 3. Installation manuelle (sans Docker)

#### Base de données
```bash
# Installer PostgreSQL
# Sur macOS :
brew install postgresql

# Démarrer PostgreSQL
brew services start postgresql

# Créer la base de données
psql postgres
CREATE DATABASE anonymeforum;
\q

# Exécuter le script d'initialisation
psql -d anonymeforum -f db/init.sql
```

#### API
```bash
cd api
npm install

# Créer un fichier .env
cat > .env << EOF
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=anonymeforum
EOF

# Démarrer l'API
npm start
```

#### Sender
```bash
cd sender
npm install

# Créer un fichier .env
cat > .env << EOF
VITE_API_URL=http://localhost:3000
VITE_THREAD_URL=http://localhost
EOF

# Démarrer en mode développement
npm run dev
```

#### Thread
```bash
cd thread
npm install

# Créer un fichier .env
cat > .env << EOF
VITE_API_URL=http://localhost:3000
VITE_SENDER_URL=http://localhost:8080
EOF

# Démarrer en mode développement
npm run dev
```

## ☁️ Déploiement sur AWS

### 1. Configuration Terraform Cloud

1. Créer un compte sur [Terraform Cloud](https://app.terraform.io/)
2. Créer une organisation (ex: `pauldebril`)
3. Créer un workspace (ex: `anonyme-forum`)
4. Configurer les variables d'environnement :
   - `AWS_ACCESS_KEY_ID` (sensitive)
   - `AWS_SECRET_ACCESS_KEY` (sensitive)

### 2. Configuration GitHub Actions

1. Créer un Personal Access Token GitHub :
   - Settings → Developer settings → Personal access tokens → Tokens (classic)
   - Permissions : `read:packages`

2. Ajouter les secrets dans le repository GitHub :
   - `Settings` → `Secrets and variables` → `Actions`
   - Ajouter `GITHUB_TOKEN` avec votre PAT

### 3. Build et Push des images Docker

Les images Docker sont automatiquement construites et poussées sur GitHub Container Registry à chaque push sur une branche grâce à GitHub Actions.

Le workflow `.github/workflows/docker-build.yml` :
- Build les 3 images (API, Sender, Thread)
- Tag avec le SHA du commit (7 premiers caractères)
- Push sur `ghcr.io/pauldebril/anonymeforum-{service}:{tag}`

### 4. Déployer l'infrastructure

```bash
cd terraform

# Initialiser Terraform
terraform init

# Vérifier le plan
terraform plan \
  -var="github_token=ghp_VOTRE_TOKEN" \
  -var="docker_tag=COMMIT_SHA" \
  -var="environment=test"

# Appliquer les changements
terraform apply \
  -var="github_token=ghp_VOTRE_TOKEN" \
  -var="docker_tag=COMMIT_SHA" \
  -var="environment=test" \
  -auto-approve
```

**Variables Terraform :**
- `github_token` : Token GitHub pour pull les images Docker
- `docker_tag` : Tag des images Docker (SHA du commit)
- `environment` : Environnement de déploiement (test/prod)

### 5. Récupérer les IPs des instances

```bash
terraform output
```

Vous obtiendrez :
```
sender_instance_public_ip = "3.73.121.211"
thread_instance_public_ip = "54.93.98.102"
api_instance_public_ip = "18.192.38.134"
db_instance_private_ip = "172.31.46.103"
```

## 🔧 Configuration des IPs dynamiques

### Problème résolu

Les applications React (Sender et Thread) nécessitent des URLs statiques au moment du build. Pour permettre des IPs dynamiques, nous utilisons une configuration **runtime** au lieu de variables d'environnement compile-time.

### Solution implémentée

#### 1. Fichiers `config.js` dans `public/`

Chaque application frontend a un fichier `public/config.js` :

**Sender** (`sender/public/config.js`) :
```javascript
window.ENV_CONFIG = {
  VITE_API_URL: 'http://localhost:3000',
  VITE_THREAD_URL: 'http://localhost'
};
```

**Thread** (`thread/public/config.js`) :
```javascript
window.ENV_CONFIG = {
  VITE_API_URL: 'http://localhost:3000',
  VITE_SENDER_URL: 'http://localhost:8080'
};
```

#### 2. Chargement dans `index.html`

```html
<script src="/config.js"></script>
```

#### 3. Utilisation dans le code TypeScript

**API calls** (`src/services/api.ts`) :
```typescript
const API_BASE = (window.ENV_CONFIG?.VITE_API_URL || 
                  import.meta.env.VITE_API_URL || 
                  'http://localhost:3000') as string;
```

**Navigation links** :
```typescript
<a href={(window as unknown as { ENV_CONFIG?: { VITE_THREAD_URL?: string } })
         .ENV_CONFIG?.VITE_THREAD_URL || "http://localhost"}>
  Voir tous les messages
</a>
```

#### 4. Injection par Terraform

Terraform injecte les IPs réelles dans les containers via `docker exec` :

```hcl
resource "null_resource" "update_sender_config" {
  provisioner "remote-exec" {
    inline = [
      "docker exec forum-sender-${var.environment} sh -c \"echo 'window.ENV_CONFIG = { VITE_API_URL: \\\"http://${aws_instance.api.public_ip}:3000\\\", VITE_THREAD_URL: \\\"http://${aws_instance.thread.public_ip}\\\" };' > /usr/share/nginx/html/config.js\""
    ]
  }
}
```

### Avantages

✅ Images Docker génériques (pas d'IPs hardcodées)  
✅ Configuration runtime (pas de rebuild nécessaire)  
✅ IPs vraiment dynamiques grâce à Terraform  
✅ Fallback sur localhost pour dev local  

## 📁 Structure du projet

```
AnonymeForum/
├── .github/
│   └── workflows/
│       └── docker-build.yml        # CI/CD GitHub Actions
├── api/
│   ├── src/
│   │   ├── app.js                  # Configuration Express
│   │   ├── db.js                   # Connexion PostgreSQL
│   │   └── server.js               # Point d'entrée
│   ├── tests/
│   │   └── app.test.js             # Tests Jest
│   ├── .env.example                # Template variables d'env
│   ├── Dockerfile                  # Image Docker API
│   └── package.json
├── sender/
│   ├── public/
│   │   └── config.js               # Config runtime
│   ├── src/
│   │   ├── pages/
│   │   │   ├── MessageForm.tsx     # Formulaire de message
│   │   │   └── Status.tsx          # Page de statut
│   │   ├── services/
│   │   │   └── api.ts              # Client API
│   │   ├── App.tsx                 # Composant principal
│   │   └── main.tsx                # Point d'entrée
│   ├── .env.example
│   ├── Dockerfile                  # Image Docker Sender
│   └── package.json
├── thread/
│   ├── public/
│   │   └── config.js               # Config runtime
│   ├── src/
│   │   ├── components/
│   │   │   └── MessageList.tsx     # Liste des messages
│   │   ├── services/
│   │   │   └── api.ts              # Client API
│   │   ├── utils/
│   │   │   └── messageUtils.ts     # Utilitaires
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── tests/
│   │   └── messageUtils.test.ts    # Tests Vitest
│   ├── .env.example
│   ├── Dockerfile                  # Image Docker Thread
│   └── package.json
├── db/
│   └── init.sql                    # Script d'initialisation DB
├── terraform/
│   ├── main.tf                     # Configuration principale
│   ├── variables.tf                # Variables Terraform
│   ├── outputs.tf                  # Outputs (IPs, SSH commands)
│   ├── ec2.tf                      # Instances EC2 + provisioners
│   ├── sg.tf                       # Security Group
│   └── terraform.tfvars            # Valeurs des variables
├── docker-compose.yml              # Orchestration locale
└── README.md                       # Ce fichier
```

## 🔄 Workflow CI/CD

### 1. Développement

```bash
# Créer une branche
git checkout -b feature/ma-feature

# Développer et tester localement
docker-compose up -d

# Commit et push
git add .
git commit -m "feat: ma nouvelle feature"
git push origin feature/ma-feature
```

### 2. Build automatique

Lors du push, GitHub Actions :
1. Build les 3 images Docker
2. Run les tests (Jest pour API, Vitest pour Thread)
3. Lint le code (ESLint)
4. Tag les images avec le SHA du commit
5. Push sur GitHub Container Registry

### 3. Déploiement

```bash
# Récupérer le SHA du commit
git log -1 --format=%h

# Déployer sur AWS
cd terraform
terraform apply \
  -var="github_token=ghp_VOTRE_TOKEN" \
  -var="docker_tag=fb1eee5" \
  -var="environment=test" \
  -auto-approve
```

### 4. Vérification

```bash
# Récupérer les IPs
terraform output

# Tester l'API
curl http://<API_IP>:3000/hello
curl http://<API_IP>:3000/messages

# Tester les configs injectées
curl http://<SENDER_IP>:8080/config.js
curl http://<THREAD_IP>/config.js
```

## 🎯 Utilisation

### Interface Sender (http://SENDER_IP:8080)

1. **Créer un message** :
   - Entrer un pseudo
   - Entrer un contenu
   - Cliquer sur "Envoyer le message"

2. **Voir tous les messages** :
   - Cliquer sur "Voir tous les messages"
   - Redirige vers l'interface Thread

### Interface Thread (http://THREAD_IP)

1. **Voir les messages** :
   - Tous les messages s'affichent automatiquement
   - Classés par ordre de création

2. **Retour vers Sender** :
   - Cliquer sur l'icône "Home" en haut à gauche

### API Endpoints (http://API_IP:3000)

- `GET /hello` - Message de bienvenue
- `GET /health` - Health check
- `GET /messages` - Liste tous les messages
- `POST /messages` - Créer un nouveau message
  ```json
  {
    "pseudo": "John",
    "contenu": "Mon message"
  }
  ```

## 🐛 Troubleshooting

### Les services ne démarrent pas

```bash
# Vérifier les logs Docker sur une instance
ssh -i paul-debril-forum-key-test.pem ec2-user@<IP>
docker logs forum-sender-test  # ou forum-thread-test, forum-api-test
```

### Les liens pointent vers localhost

```bash
# Vérifier que config.js a bien été injecté
curl http://<SENDER_IP>:8080/config.js
curl http://<THREAD_IP>/config.js

# Re-exécuter les provisioners
cd terraform
terraform taint null_resource.update_sender_config
terraform taint null_resource.update_thread_config
terraform apply -var="github_token=..." -var="docker_tag=..." -var="environment=test" -auto-approve
```

### Erreur de connexion à la base de données

```bash
# Vérifier que l'IP privée de la DB est correcte dans user_data de l'API
terraform output db_instance_private_ip

# Vérifier les logs de l'API
ssh -i paul-debril-forum-key-test.pem ec2-user@<API_IP>
docker logs forum-api-test
```

### Images Docker introuvables

```bash
# Vérifier que les images existent sur GitHub Container Registry
# https://github.com/PaulDebril?tab=packages

# Re-build et push les images
git push origin <branch>

# Vérifier le tag dans GitHub Actions
```

### Security Group bloque le trafic

```bash
# Vérifier les règles du security group
cd terraform
terraform state show aws_security_group.web

# Règles nécessaires :
# - Port 22 (SSH) : 0.0.0.0/0
# - Port 80 (HTTP) : 0.0.0.0/0
# - Port 3000 (API) : 0.0.0.0/0
# - Port 8080 (Sender) : 0.0.0.0/0
# - Port 5432 (PostgreSQL) : 172.31.0.0/16 (VPC uniquement)
```

## 📝 Notes importantes

### Variables d'environnement

Les fichiers `.env.example` montrent les variables nécessaires mais **ne sont pas utilisés en production**. La configuration runtime via `config.js` les remplace.

### Sécurité

- La base de données n'est accessible que depuis le VPC (CIDR `172.31.0.0/16`)
- Les clés SSH sont générées automatiquement par Terraform
- Le GitHub Token doit avoir uniquement les permissions `read:packages`

### Coûts AWS

Avec 4 instances (1 t2.micro + 3 t2.nano), le coût estimé est d'environ **$15-20/mois** en région `eu-central-1`.

### Destruction de l'infrastructure

```bash
cd terraform
terraform destroy \
  -var="github_token=ghp_VOTRE_TOKEN" \
  -var="docker_tag=fb1eee5" \
  -var="environment=test" \
  -auto-approve
```

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT.

## 👤 Auteur

**Paul Debril**
- GitHub: [@PaulDebril](https://github.com/PaulDebril)

## 🙏 Remerciements

- React Team pour React et Vite
- HashiCorp pour Terraform
- AWS pour l'infrastructure cloud
