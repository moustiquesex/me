# Publication et illustrations

La page d'accueil est générée depuis les publications JSON et les modèles templates/home-fr.html et templates/home-en.html. La racine est en anglais. Les tags restent en anglais dans les deux versions.

## Espace auteur local

Depuis ce dossier :

    npm ci
    npm run editor

Ouvrir http://127.0.0.1:4174. Choisir une publication ou « Nouvelle publication ». Les textes français et anglais se rédigent dans leurs onglets respectifs. Les illustrations JPEG, PNG et WebP sont limitées à 5 Mio, vérifiées par décodage, réencodées en WebP et enregistrées sous un nom aléatoire. Renseigner la description, le crédit et la source pour une image de tiers. Les boutons de tags proposent un vocabulaire anglais réutilisable.

« Enregistrer » conserve les changements sur cet ordinateur. « Envoyer sur GitHub » les pousse avec la session GitHub autorisée. GitHub Actions valide les images et PDF avant de publier. Aucun jeton GitHub n'est envoyé au navigateur public. Les fichiers du dépôt sont publics, même pour une publication non affichée. Ne pas téléverser un PDF destiné uniquement à être envoyé sur demande.

Les coeurs de la page d'accueil sont une interaction en mémoire dans l'onglet : ils ne représentent pas un compteur collectif et se réinitialisent au rechargement. Aucun serveur de votes, cookie ou stockage persistant n'est utilisé. Un compteur partagé nécessiterait un service serveur distinct.

## Contrôles

    npm run build
    npm run check
    node scripts/test-image-upload.mjs

Le test d'images utilise temporairement le port 4174 : arrêter l'éditeur avant de le lancer. Il supprime ses fichiers d'essai et ne publie rien.
