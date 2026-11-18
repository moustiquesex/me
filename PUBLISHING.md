# Publication et illustrations

La page d'accueil est générée depuis les publications JSON et les modèles templates/home-fr.html et templates/home-en.html. La racine est en anglais. Les tags restent en anglais dans les deux versions.

## Espace auteur local

Depuis ce dossier :

    npm ci
    npm run editor

Ouvrir http://127.0.0.1:4174. Choisir une publication ou « Nouvelle publication ». Les textes français et anglais se rédigent dans leurs onglets respectifs. Les illustrations JPEG, PNG et WebP sont limitées à 5 Mio, vérifiées par décodage, réencodées en WebP et enregistrées sous un nom aléatoire. Renseigner la description, le crédit et la source pour une image de tiers. Les boutons de tags proposent un vocabulaire anglais réutilisable.

« Enregistrer » conserve les changements sur cet ordinateur. « Envoyer sur GitHub » les pousse avec la session GitHub autorisée. GitHub Actions valide les images et PDF avant de publier. Aucun jeton GitHub n'est envoyé au navigateur public. Les fichiers du dépôt sont publics, même pour une publication non affichée. Ne pas téléverser un PDF destiné uniquement à être envoyé sur demande.

Les cœurs sont partagés entre les visiteurs grâce à Cloudflare Workers et D1, tout en conservant GitHub Pages pour le site. Le total apparaît sous chaque publication, identique dans les versions française et anglaise. Un identifiant de navigateur est créé uniquement au premier clic, pour retrouver ou retirer la réaction. Les réactions expirent après 365 jours. Ce compteur ne révèle pas l’identité des visiteurs et ne mesure pas des personnes uniques. Aucun abonnement payant n’a été activé. La configuration et les tests du service sont documentés dans reactions/README.md. Les ajouts de publications via le portail ne nécessitent pas de redéployer le compteur.

## Contrôles

    npm run build
    npm run check
    node scripts/test-image-upload.mjs

Le test d'images utilise temporairement le port 4174 : arrêter l'éditeur avant de le lancer. Il supprime ses fichiers d'essai et ne publie rien.
