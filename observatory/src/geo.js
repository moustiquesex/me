/**
 * Géométrie de la zone d'intérêt et génération des trajectoires.
 *
 * Deux corrections importantes par rapport à une lecture naïve de la carte.
 *
 * Premièrement, l'ADIZ historique de Taïwan, héritée du traité de défense
 * sino-américain, recouvre une large part du continent. Le ministère de la
 * Défense n'utilise plus ce contour dans ses cartes quotidiennes mais une ADIZ
 * de fait, dont la limite occidentale est la ligne médiane et ses extensions.
 * Les incursions comptabilisées par la base sont celles qui franchissent cette
 * limite de fait, c'est donc elle que la carte met en avant.
 *
 * Deuxièmement, les communiqués nomment cinq à six secteurs d'entrée, nord,
 * centre, sud-ouest, sud-est et est, plus occasionnellement ouest. Le modèle
 * reprend ce découpage plutôt qu'un partage inventé en trois zones.
 *
 * Les contours restent des approximations destinées à la lecture visuelle.
 */

export const TAIWAN_CENTER = [23.7, 121.0];
export const DEFAULT_ZOOM = 7;

/** Ligne médiane du détroit, dite ligne Davis, entre 27N 122E et 23N 118E. */
export const MEDIAN_LINE = [
  [27.0, 122.0],
  [23.0, 118.0],
];

/**
 * ADIZ de fait. Sa limite ouest suit la ligne médiane puis ses extensions,
 * c'est le périmètre auquel se réfèrent les communiqués quotidiens.
 */
export const ADIZ_DEFACTO = [
  [27.0, 122.0],
  [28.4, 123.6],
  [28.4, 125.2],
  [21.2, 125.2],
  [21.2, 118.6],
  [23.0, 118.0],
];

/** ADIZ historique, conservée en couche optionnelle à titre de comparaison. */
export const ADIZ_HISTORIC = [
  [26.6, 117.5],
  [28.9, 119.8],
  [28.9, 125.4],
  [21.0, 125.4],
  [21.0, 117.5],
];

/**
 * Secteurs d'entrée nommés dans les communiqués. Le dégradé de bleu hiérarchise
 * les volumes, le rouge reste réservé au franchissement de la ligne médiane.
 */
export const ZONES = [
  {
    id: "north",
    label: "Nord de l'ADIZ",
    short: "Nord",
    color: "#12304F",
    entry: [27.0, 121.4],
    exit: [25.5, 121.6],
    bend: 0.24,
    spread: 0.6,
  },
  {
    id: "central",
    label: "Centre de l'ADIZ",
    short: "Centre",
    color: "#1A3F68",
    entry: [25.1, 119.6],
    exit: [24.1, 120.5],
    bend: 0.26,
    spread: 0.55,
  },
  {
    id: "southwest",
    label: "Sud-Ouest de l'ADIZ",
    short: "Sud-Ouest",
    color: "#2E6FB4",
    entry: [21.6, 118.3],
    exit: [22.7, 120.0],
    bend: 0.3,
    spread: 0.85,
  },
  {
    id: "southeast",
    label: "Sud-Est de l'ADIZ",
    short: "Sud-Est",
    color: "#4E92CE",
    entry: [21.5, 122.8],
    exit: [22.6, 121.3],
    bend: 0.26,
    spread: 0.7,
  },
  {
    id: "east",
    label: "Est de l'ADIZ",
    short: "Est",
    color: "#8FBFE8",
    entry: [24.6, 124.6],
    exit: [23.6, 122.4],
    bend: 0.24,
    spread: 0.7,
  },
];

/**
 * Emprise géographique de chaque secteur.
 *
 * AVERTISSEMENT DE MÉTHODE. Le ministère de la Défense de Taïwan nomme ses
 * secteurs d'entrée sans jamais en publier les limites. Aucun découpage
 * officiel n'existe, et aucun découpage n'est communément admis dans la
 * littérature. Ce qui suit est donc une construction de l'auteur de cet outil,
 * et doit être présentée comme telle dans tout travail scientifique.
 *
 * Le construit retenu part de la seule chose que le vocabulaire officiel donne
 * réellement, à savoir une direction par rapport à l'île. Nord, centre,
 * sud-ouest, sud-est et est se lisent depuis Taïwan. Le découpage est donc une
 * rose des vents centrée sur l'île, dont chaque quartier est tendu jusqu'au
 * contour de l'ADIZ de fait. La limite occidentale épouse ainsi la ligne
 * médiane sans qu'il faille la redessiner, et les frontières entre secteurs
 * deviennent des rayons plutôt que des angles droits arbitraires.
 *
 * Une première version de cet outil employait un pavage en rectangles de
 * latitude et de longitude. Ce choix était commode mais indéfendable, il
 * suggérait des limites administratives qui n'existent pas.
 */

/** Origine de la rose des vents, centre approximatif de l'île. */
export const SECTOR_ORIGIN = [23.75, 120.95];

/**
 * Ouverture angulaire de chaque secteur, en degrés de relèvement compas.
 * Zéro pointe le nord, quatre-vingt-dix l'est.
 */
export const SECTOR_BEARINGS = {
  north: [318, 44],
  east: [44, 128],
  southeast: [128, 196],
  southwest: [196, 262],
  central: [262, 318],
};

/** Rayon intérieur, il évite que les quartiers ne se pincent sur l'île. */
const INNER_RADIUS = 0.85;

function bearingVector(bearing, lat) {
  const rad = (bearing * Math.PI) / 180;
  const shrink = Math.cos((lat * Math.PI) / 180);
  return { dLat: Math.cos(rad), dLng: Math.sin(rad) / Math.max(shrink, 0.2) };
}

/**
 * Distance du centre au contour de l'ADIZ le long d'un relèvement donné.
 * Le calcul cherche la première arête coupée par le rayon.
 */
function reachAlongBearing(origin, bearing, polygon) {
  const { dLat, dLng } = bearingVector(bearing, origin[0]);
  let nearest = Infinity;

  for (let i = 0; i < polygon.length; i += 1) {
    const a = polygon[i];
    const b = polygon[(i + 1) % polygon.length];

    const eLat = b[0] - a[0];
    const eLng = b[1] - a[1];
    const denominator = dLat * eLng - dLng * eLat;
    if (Math.abs(denominator) < 1e-9) continue;

    const rLat = a[0] - origin[0];
    const rLng = a[1] - origin[1];

    // t parcourt le rayon, u parcourt l'arête
    const t = (rLat * eLng - rLng * eLat) / denominator;
    const u = (rLat * dLng - rLng * dLat) / denominator;

    if (t > 0 && u >= 0 && u <= 1 && t < nearest) nearest = t;
  }

  return Number.isFinite(nearest) ? nearest : 3;
}

function pointAt(origin, bearing, distance) {
  const { dLat, dLng } = bearingVector(bearing, origin[0]);
  return [origin[0] + dLat * distance, origin[1] + dLng * distance];
}

/** Construit un quartier de rose des vents épousant le contour fourni. */
function buildWedge(origin, [from, to], polygon, step = 3) {
  const span = (to - from + 360) % 360;
  const steps = Math.max(4, Math.ceil(span / step));
  const outer = [];
  const inner = [];

  for (let i = 0; i <= steps; i += 1) {
    const bearing = (from + (span * i) / steps) % 360;
    outer.push(pointAt(origin, bearing, reachAlongBearing(origin, bearing, polygon)));
    inner.push(pointAt(origin, bearing, INNER_RADIUS));
  }

  return [...outer, ...inner.reverse()];
}

export const ZONE_SHAPES = Object.fromEntries(
  Object.entries(SECTOR_BEARINGS).map(([id, range]) => [
    id,
    buildWedge(SECTOR_ORIGIN, range, ADIZ_DEFACTO),
  ])
);

/** Point d'ancrage du symbole proportionnel, au milieu du quartier. */
export const ZONE_ANCHORS = Object.fromEntries(
  Object.entries(SECTOR_BEARINGS).map(([id, [from, to]]) => {
    const span = (to - from + 360) % 360;
    const middle = (from + span / 2) % 360;
    const reach = reachAlongBearing(SECTOR_ORIGIN, middle, ADIZ_DEFACTO);
    return [id, pointAt(SECTOR_ORIGIN, middle, INNER_RADIUS + (reach - INNER_RADIUS) * 0.52)];
  })
);

/** Segment médian d'un secteur, utilisé pour répartir la densité de chaleur. */
export const ZONE_AXES = Object.fromEntries(
  Object.entries(SECTOR_BEARINGS).map(([id, [from, to]]) => {
    const span = (to - from + 360) % 360;
    const middle = (from + span / 2) % 360;
    const reach = reachAlongBearing(SECTOR_ORIGIN, middle, ADIZ_DEFACTO);
    return [id, { bearing: middle, span, inner: INNER_RADIUS, outer: reach }];
  })
);

export const ZONE_IDS = ZONES.map((z) => z.id);
export const CROSSING_COLOR = "#C8102E";

/** Repli des secteurs marginaux vers les cinq secteurs cartographiés. */
export const SECTOR_ALIASES = {
  west: "central",
  northwest: "north",
  northeast: "north",
  south: "southwest",
};

export function emptyZones() {
  return Object.fromEntries(ZONE_IDS.map((id) => [id, 0]));
}

/**
 * Répartit un volume sur les seuls secteurs effectivement cités par le
 * communiqué. C'est plus honnête qu'une clé de répartition inventée, puisque
 * le ministère nomme les secteurs sans jamais publier le détail par secteur.
 */
export function distributeOverSectors(total, sectors) {
  const zones = emptyZones();
  const targets = [...new Set(sectors.map((s) => SECTOR_ALIASES[s] || s))].filter((s) =>
    ZONE_IDS.includes(s)
  );
  if (!targets.length || !total) return zones;

  const base = Math.floor(total / targets.length);
  let remainder = total - base * targets.length;

  for (const id of targets) {
    zones[id] = base + (remainder > 0 ? 1 : 0);
    if (remainder > 0) remainder -= 1;
  }

  return zones;
}

/* -------------------------------------------------------------------------- */
/* Générateur pseudo aléatoire déterministe                                    */
/* -------------------------------------------------------------------------- */

export function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* -------------------------------------------------------------------------- */
/* Courbes                                                                     */
/* -------------------------------------------------------------------------- */

export function curve(from, to, bend, steps = 44) {
  const midLat = (from[0] + to[0]) / 2;
  const midLng = (from[1] + to[1]) / 2;
  const dLat = to[0] - from[0];
  const dLng = to[1] - from[1];
  const ctrl = [midLat - dLng * bend, midLng + dLat * bend];

  const points = [];
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    const u = 1 - t;
    points.push([
      u * u * from[0] + 2 * u * t * ctrl[0] + t * t * to[0],
      u * u * from[1] + 2 * u * t * ctrl[1] + t * t * to[1],
    ]);
  }
  return points;
}

/**
 * Enveloppe lisse autour d'un axe, employée pour les passages maritimes.
 *
 * Un rectangle de latitude et de longitude ne décrit pas un détroit, il
 * déborde sur les côtes et suggère une limite qui n'existe pas. Cette
 * enveloppe suit un axe tracé dans l'eau et s'en écarte d'une largeur
 * constante, avec des extrémités arrondies. Le résultat épouse la géographie
 * au lieu de la contredire.
 */
export function corridor(axis, width = 0.4, steps = 10) {
  const smoothAxis = route(axis, 0.04);
  const left = [];
  const right = [];

  for (let i = 0; i < smoothAxis.length; i += 1) {
    const prev = smoothAxis[Math.max(0, i - 1)];
    const next = smoothAxis[Math.min(smoothAxis.length - 1, i + 1)];

    const dLat = next[0] - prev[0];
    const dLng = (next[1] - prev[1]) * Math.cos((smoothAxis[i][0] * Math.PI) / 180);
    const norm = Math.hypot(dLat, dLng) || 1;

    // Normale à l'axe, corrigée du rétrécissement des méridiens
    const nLat = -dLng / norm;
    const nLng = dLat / norm / Math.cos((smoothAxis[i][0] * Math.PI) / 180);

    left.push([smoothAxis[i][0] + nLat * width, smoothAxis[i][1] + nLng * width]);
    right.push([smoothAxis[i][0] - nLat * width, smoothAxis[i][1] - nLng * width]);
  }

  // Extrémités arrondies plutôt que coupées net
  const cap = (center, from, to) => {
    const points = [];
    for (let i = 1; i < steps; i += 1) {
      const t = i / steps;
      const angle = Math.PI * t;
      points.push([
        center[0] + (from[0] - center[0]) * Math.cos(angle) + (to[0] - center[0]) * Math.sin(angle),
        center[1] + (from[1] - center[1]) * Math.cos(angle) + (to[1] - center[1]) * Math.sin(angle),
      ]);
    }
    return points;
  };

  return [
    ...left,
    ...cap(smoothAxis[smoothAxis.length - 1], left[left.length - 1], right[right.length - 1]),
    ...right.reverse(),
    ...cap(smoothAxis[0], right[right.length - 1], left[0]),
  ];
}

export function route(points, bend = 0.12) {
  const path = [];
  for (let i = 0; i < points.length - 1; i += 1) {
    const segment = curve(points[i], points[i + 1], bend, 24);
    path.push(...(i === 0 ? segment : segment.slice(1)));
  }
  return path;
}

/* -------------------------------------------------------------------------- */
/* Trajectoires quotidiennes                                                   */
/* -------------------------------------------------------------------------- */

function trackCount(aircraft) {
  if (!aircraft || aircraft <= 0) return 0;
  return Math.max(1, Math.min(12, Math.round(aircraft / 4)));
}

export function buildTracks(day) {
  if (!day) return [];
  const tracks = [];

  for (const zone of ZONES) {
    const aircraft = day.zones?.[zone.id] ?? 0;
    const n = trackCount(aircraft);
    if (n === 0) continue;

    const perTrack = Math.max(1, Math.round(aircraft / n));

    for (let i = 0; i < n; i += 1) {
      const rand = mulberry32(hashString(`${day.iso}|${zone.id}|${i}`));
      const jitter = (amp) => (rand() - 0.5) * amp;

      const from = [zone.entry[0] + jitter(zone.spread), zone.entry[1] + jitter(zone.spread)];
      const to = [
        zone.exit[0] + jitter(zone.spread * 0.55),
        zone.exit[1] + jitter(zone.spread * 0.55),
      ];
      const bend = zone.bend * (0.5 + rand() * 1.1) * (rand() > 0.5 ? 1 : -1);

      tracks.push({
        id: `${day.iso}|${zone.id}|${i}`,
        zoneId: zone.id,
        zoneLabel: zone.label,
        color: zone.color,
        path: curve(from, to, bend),
        aircraft: perTrack,
        slow: rand() > 0.55,
        head: to,
      });
    }
  }

  return tracks;
}

export function buildMedianCrossings(day) {
  if (!day || !day.medianLine) return [];

  const n = Math.max(1, Math.min(8, Math.round(day.medianLine / 6)));
  const crossings = [];

  for (let i = 0; i < n; i += 1) {
    const rand = mulberry32(hashString(`${day.iso}|median|${i}`));
    const t = 0.12 + rand() * 0.76;
    const lat = MEDIAN_LINE[0][0] + (MEDIAN_LINE[1][0] - MEDIAN_LINE[0][0]) * t;
    const lng = MEDIAN_LINE[0][1] + (MEDIAN_LINE[1][1] - MEDIAN_LINE[0][1]) * t;

    crossings.push({
      id: `${day.iso}|median|${i}`,
      path: curve(
        [lat + (rand() - 0.5) * 0.5, lng - 0.8 - rand() * 0.5],
        [lat + (rand() - 0.5) * 0.5, lng + 0.8 + rand() * 0.5],
        (rand() - 0.5) * 0.4,
        26
      ),
      aircraft: Math.max(1, Math.round(day.medianLine / n)),
    });
  }

  return crossings;
}
