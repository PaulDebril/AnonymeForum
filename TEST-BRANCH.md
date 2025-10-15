# 🧪 Branche Test - AnonymeForum

## Objectif
Cette branche `test` permet de valider les changements de CI/CD sans impacter la production sur `main`.

## Ressources séparées
- **Environnement** : `test` 
- **Security Group** : `paul-debril-forum-sg-test`
- **Instances EC2** : suffixées avec `-test`
- **Conteneurs Docker** : `forum-{service}-test`
- **Clé SSH** : `paul-debril-forum-key-test.pem`

## Comment tester

### 1. Faire un changement dans le code
```bash
# Modifier un fichier quelconque
echo "// test change" >> sender/src/App.tsx
git add .
git commit -m "test: validation CI/CD pipeline"
git push origin test
```

### 2. Surveiller la CI/CD
- Aller sur GitHub Actions
- Voir les jobs : Build → Deploy → Update Services
- Récupérer les URLs dans les logs finaux

### 3. Valider le fonctionnement
- Tester les URLs générées
- Vérifier que les services communiquent bien
- Contrôler les logs Docker si besoin

## Nettoyage après test

Si tout fonctionne :
```bash
git checkout main
git merge test
git push origin main
git branch -d test
```

Si ça ne marche pas :
```bash
git checkout main
git branch -D test  # Supprime la branche sans merge
```

## Avantages
✅ Isolation complète de la production  
✅ Test de bout en bout réaliste  
✅ Possibilité de rollback facile  
✅ Pas de pollution de l'historique main