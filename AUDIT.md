# Audit du site — 18 novembre 2026

## Périmètre et résultat

Revue des sources du nouveau site, du générateur, du JavaScript public, de la configuration Pages CMS et du workflow GitHub Actions. Le code de l’ancien site et les services GitHub, Google et Pages CMS ne sont pas couverts par une certification de sécurité. Le déploiement distant et le traitement Linux d’un vrai PDF restent à vérifier.

## Contrôles présents

- Contenu éditorial échappé avant insertion dans HTML. Corps des articles traité comme texte, sans HTML arbitraire.
- Aucun secret API dans les sources publiques. L’authentification auteur est déléguée à GitHub et Pages CMS. Le jeton temporaire du workflow est géré par GitHub Actions.
- Politique CSP locale, scripts et styles de même origine, formulaires publics désactivés, absence de bibliothèque JavaScript distante. Le bloc JSON-LD est inerte et ne déclenche pas de requête.
- Le CMS propose uniquement les fichiers PDF et un renommage aléatoire.
- Le workflow Linux contrôle chaque fichier du répertoire uploads avant publication. Limite de 10 Mio, fichier régulier, signature PDF, fin de fichier, MIME application/pdf détecté par libmagic, contrôle structurel qpdf, rejet de plusieurs actions et contenus actifs ainsi que des PDF chiffrés. Un échec bloque le déploiement.
- Les fichiers publiés reçoivent des noms UUID. Les PDF sur demande ne sont pas copiés dans le site.
- Le lecteur intégré utilise un PDF local et conserve un lien de téléchargement.

## Limites à traiter selon le mode retenu

Le contrôle est exécuté après l’enregistrement par le CMS dans GitHub. Il ne garantit donc pas le rejet avant stockage demandé pour un serveur d’upload dédié. Les permissions GitHub limitent l’écriture aux personnes autorisées, mais le filtrage de l’interface n’est pas une barrière serveur suffisante. Les fichiers d’origine et brouillons d’un dépôt public sont consultables et peuvent rester dans son historique. Les noms aléatoires du site ne rendent pas ces fichiers privés.

La détection de contenu actif et qpdf ne sont pas un antivirus. Une exigence de réception strictement contrôlée avant stockage demande un serveur authentifié avec quota, limite du corps de requête, détection MIME depuis les octets, parseur PDF, stockage privé de quarantaine et publication après contrôle. Ce composant n’est pas fourni par GitHub Pages. Il reste à implémenter si cette exigence est maintenue, avant d’utiliser un upload personnalisé.

GitHub Pages ne permet pas de configurer tous les en-têtes de réponse via le code du site. La CSP en balise meta ne fournit pas frame-ancestors, ni les en-têtes HSTS ou X-Content-Type-Options. Les en-têtes réels doivent être vérifiés après déploiement. Activer HTTPS pour le domaine. L’erreur de certificat de l’ancien site reste à résoudre.

## Traceurs et appels externes

Le site généré charge uniquement /assets/site.css, /assets/site.js, /assets/inter.woff2, le portrait et le favicon locaux. Aucun analytics, pixel, police distante, SDK social ou script tiers. Aucun cookie, localStorage ou sessionStorage dans le JavaScript livré. La langue suggérée est calculée en mémoire depuis navigator.language. Les liens vers LinkedIn, ORCID, Pages CMS, l’APD et les politiques de fournisseurs sont des liens ordinaires, activés par le visiteur. Les correspondances passent par son logiciel de messagerie puis Gmail. L’hébergeur peut journaliser les données techniques selon ses propres règles. L’absence de bandeau correspond à cette configuration et doit être réévaluée si un service de suivi est ajouté.

## Informations juridiques

Les pages FR/EN indiquent Idriss Bouhière, son adresse de contact et les coordonnées de GitHub, ainsi que les finalités des échanges, la base légale envisagée, les droits, l’APD et les prestataires. La durée de douze mois après le dernier échange est une proposition de politique de conservation à appliquer effectivement ou à adapter.

L’article XII.6 du Code de droit économique concerne les prestataires de services de la société de l’information. L’application à une activité personnelle de présentation, et l’éventuelle qualification professionnelle du site, doivent être appréciées selon l’activité réelle. La seule mention « particulier non commercial » ne garantit pas une exemption. Si cet article s’applique, des informations supplémentaires peuvent être requises, dont une adresse géographique. Aucune adresse personnelle n’a été inventée ou publiée. La page constitue un projet d’information juridique et non une validation de conformité.

Les travaux signés restent attribués à l’auteur, sous réserve des droits de tiers et accords institutionnels. Le choix retenu est « tous droits réservés », avec respect des exceptions légales. Aucune licence ouverte n’a été imposée. Une licence Creative Commons peut être choisie document par document si souhaité.

Sources officielles consultées

- https://autoriteprotectiondonnees.be/citoyen/themes/internet/cookies
- https://economie.fgov.be/sites/default/files/Files/Entreprises/Guidelines-destinees-aux-secteurs-qui-souhaitent-creer-une-entite-qualifiee.pdf
- https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement
- https://docs.github.com/en/site-policy/content-removal-policies/guide-to-submitting-a-dmca-takedown-notice

## Vérifications exécutées

Construction des pages FR/EN et contrôle de 173 liens et ressources locaux, métadonnées, JSON-LD et configuration CMS. Vérification navigateur du rendu d’accueil, des filtres par format, année et discipline, du lien de demande de PDF et de la copie APA avec un article technique temporaire ensuite supprimé. Les citations BibTeX sont affichées avec leurs champs auteur, titre, année et URL. Le traitement d’un vrai PDF sur Linux et l’intégration CMS authentifiée restent non vérifiés.


## Mise à jour avec l’éditeur privé

L’éditeur ajouté est un service local lié exclusivement à 127.0.0.1. Les API exigent un jeton de session aléatoire, les écritures vérifient Origin, et Host est fixé pour limiter le DNS rebinding. Le jeton local n’est pas une clé GitHub. Git Credential Manager gère l’accès au dépôt en dehors du navigateur. Aucun secret de publication n’est embarqué dans le site public.

L’upload local exige application/pdf, limite le flux à 10 Mio et analyse les octets avec pdf-lib avant enregistrement. Le contenu actif reconnu est refusé et le nom reçu est remplacé par un UUID. Sur le serveur de construction, libmagic et qpdf constituent une deuxième validation. Les PDF restent des documents publics après envoi et ces vérifications ne constituent pas une analyse antivirus exhaustive.

Le HTML des articles est nettoyé par sanitize-html dans l’éditeur et dans le générateur. Seules des balises de texte, des liens HTTP/HTTPS/mailto et des classes de taille/alignement sont autorisées. Scripts, styles arbitraires, images externes et gestionnaires d’événements sont supprimés. Le collage dans l’éditeur est en texte simple.

Tests effectués sur l’API locale : rejet d’un contenu non PDF, d’un mauvais Content-Type, d’une origine tierce et d’un fichier supérieur à 10 Mio. Acceptation d’un PDF de test analysé, enregistré sous un nom aléatoire puis supprimé. Vérification navigateur de la rédaction et de l’alignement justifié. Les dépendances installées ont été auditées par npm avec zéro vulnérabilité signalée à cette date. La construction vérifie 20 pages HTML et 302 liens/ressources locaux après ajout des quatre notices.

L’accès est privé à cet ordinateur et à ses utilisateurs locaux. Un portail utilisable depuis d’autres appareils demanderait une authentification distante et un hébergement serveur. Pages CMS reste une alternative externe soumise à sa propre authentification. Le service local reste actif tant que sa fenêtre de lancement est ouverte.
