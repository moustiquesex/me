# Publier un article ou un PDF

Votre site public est https://bouhiere.eu. L’éditeur privé fonctionne sur votre ordinateur. Pages CMS reste une alternative pour éditer depuis un autre appareil après connexion à GitHub.

## Ouvrir l’éditeur

Ouvrez le fichier Ouvrir-editeur.cmd dans le dossier du dépôt. Il lance le service local et ouvre http://127.0.0.1:4174. Gardez la fenêtre de lancement ouverte pendant la rédaction. L’accès est limité à cet ordinateur, protégé contre les requêtes provenant d’autres sites. La publication utilise votre connexion GitHub gérée par Git Credential Manager. Aucun jeton GitHub n’est demandé dans l’éditeur.

Le dépôt de travail utilisé pour cette installation est dans work/publish-repository, sous le dossier de ce chat. Le raccourci fourni à côté de ce guide ouvre ce dépôt. Pour l’installer ailleurs, cloner le dépôt GitHub puis lancer npm ci et npm run editor avec Node.js 22 ou plus récent.

## Rédiger

1. Choisissez Nouvelle publication, puis un identifiant sans accents ni espaces, par exemple politique-europeenne-2026.
2. Indiquez la date, le format et la discipline. Utilisez Commentaire / actualité pour une brève.
3. Renseignez le titre et le résumé. Ils sont nécessaires dans au moins une langue et permettent aux visiteurs et aux moteurs de recherche de comprendre le sujet.
4. Écrivez le corps du texte dans la zone de rédaction. La barre permet les titres, trois tailles, le gras, l’italique, les listes, les liens et les alignements. La mise en forme est nettoyée avant enregistrement et au moment de la construction du site.
5. Les onglets Français et English conservent leurs textes séparément. Une traduction est facultative.

## Choisir le mode de diffusion

- Texte uniquement publie un commentaire, une actualité ou un article sans PDF.
- PDF intégré et texte optionnel affiche votre PDF dans un lecteur, avec le résumé et le commentaire rédigé dans la zone de texte. Le corps peut rester vide. Le PDF public reste téléchargeable.
- PDF sur demande affiche un bouton de demande par courriel. Conservez ce fichier hors du dépôt et transmettez-le manuellement.

Les champs Lien original et Organisme éditeur servent à référencer un article paru ailleurs sans le recopier. Ils sont indépendants du texte et du PDF.

## Enregistrer et envoyer

Enregistrer sur cet ordinateur garde les modifications dans les fichiers locaux. Activez Afficher sur le site pour publier une notice, puis cliquez sur Envoyer vers le site. Le dépôt GitHub reçoit les textes et les PDF enregistrés, y compris les notices non affichées. GitHub Actions vérifie les PDF et reconstruit le site. Le lien Suivi de publication permet de vérifier le résultat. L’envoi réussi ne garantit pas que le contrôle de déploiement a terminé.

Les documents publics sont limités à 10 Mio. Leur type réel et leur structure sont contrôlés dans l’éditeur, puis sur le serveur de construction. Les noms sont remplacés par des identifiants aléatoires. Cela ne constitue pas une analyse antivirus exhaustive. Un dépôt public ne doit contenir aucun document confidentiel.

## Référencement

Les quatre notices initiales sont classées de la plus récente à la plus ancienne. Leurs résumés sont des synthèses éditoriales. Les dates reprennent celles des pages des éditeurs. Le rôle de rédacteur, coauteur ou contributeur est précisé sur chaque notice.

Le site expose du HTML complet, des URL par langue, un sitemap, les liens ORCID et LinkedIn, des données structurées de personne et des notices de publication. Les robots de recherche peuvent explorer les pages publiques. Le flux https://bouhiere.eu/feed.json donne la liste structurée des publications. Aucun résultat Google ou recommandation d’une IA ne peut être garanti.

Pour demander à Google de découvrir le site, ouvrir Google Search Console avec votre compte Google, ajouter une propriété de préfixe https://bouhiere.eu/, effectuer la vérification demandée, puis soumettre https://bouhiere.eu/sitemap.xml. La méthode Fichier HTML ou Balise HTML permet de vérifier la propriété en ajoutant le fichier ou le code fourni au site. Codex peut faire cet ajout dès que Google fournit la valeur. Ne pas publier de mot de passe, jeton de session ou autre secret.
