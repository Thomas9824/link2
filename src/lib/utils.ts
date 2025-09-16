/**
 * Génère un code court unique pour les liens raccourcis
 */
export function generateShortCode(length: number = 6): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  return result;
}

/**
 * Domaines et mots-clés suspects à bloquer
 */
const SUSPICIOUS_DOMAINS = [
  'bit.ly', 'tinyurl.com', 'goo.gl', 't.co', // Autres raccourcisseurs (éviter les boucles)
  'malware.com', 'phishing.com', 'spam.com', // Exemples de domaines suspects
  'localhost', '127.0.0.1', '0.0.0.0', // Domaines locaux
];

const SUSPICIOUS_KEYWORDS = [
  'malware', 'phishing', 'scam', 'hack', 'crack', 'pirate',
  'download-virus', 'free-money', 'click-here-now'
];

/**
 * Valide si une URL est correcte et sécurisée
 */
export function validateUrl(url: string): boolean {
  try {
    // Vérifier la longueur (éviter les URLs trop longues)
    if (url.length > 2048) {
      return false;
    }

    const urlObj = new URL(url);

    // Vérifier le protocole
    if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
      return false;
    }

    // Vérifier les domaines suspects
    const hostname = urlObj.hostname.toLowerCase();
    for (const suspiciousDomain of SUSPICIOUS_DOMAINS) {
      if (hostname.includes(suspiciousDomain.toLowerCase())) {
        console.warn(`Blocked suspicious domain: ${hostname}`);
        return false;
      }
    }

    // Vérifier les mots-clés suspects dans l'URL complète
    const fullUrl = url.toLowerCase();
    for (const keyword of SUSPICIOUS_KEYWORDS) {
      if (fullUrl.includes(keyword)) {
        console.warn(`Blocked URL with suspicious keyword: ${keyword}`);
        return false;
      }
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Sanitise et valide un alias personnalisé
 */
export function validateCustomAlias(alias: string): { isValid: boolean; sanitized?: string; error?: string } {
  if (!alias) return { isValid: true }; // Alias optionnel

  // Nettoyer l'alias
  const sanitized = alias.trim().toLowerCase();

  // Vérifier la longueur
  if (sanitized.length < 3 || sanitized.length > 50) {
    return { isValid: false, error: 'L\'alias doit faire entre 3 et 50 caractères' };
  }

  // Vérifier les caractères autorisés (alphanumériques + tirets)
  if (!/^[a-z0-9-]+$/.test(sanitized)) {
    return { isValid: false, error: 'L\'alias ne peut contenir que des lettres, chiffres et tirets' };
  }

  // Éviter les alias réservés
  const reservedAliases = ['api', 'admin', 'dashboard', 'auth', 'login', 'register', 'www'];
  if (reservedAliases.includes(sanitized)) {
    return { isValid: false, error: 'Cet alias est réservé' };
  }

  return { isValid: true, sanitized };
}

/**
 * Sanitise le titre et la description
 */
export function sanitizeText(text: string, maxLength: number = 200): string {
  if (!text) return '';

  // Nettoyer et limiter la longueur
  return text.trim().substring(0, maxLength)
    // Supprimer les caractères potentiellement dangereux
    .replace(/<[^>]*>/g, '') // Supprimer les balises HTML
    .replace(/[<>&"']/g, '') // Supprimer caractères HTML spéciaux
    .replace(/\s+/g, ' '); // Normaliser les espaces
}

/**
 * Formate une URL en ajoutant le protocole si nécessaire
 */
export function formatUrl(url: string): string {
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`;
  }
  return url;
}

/**
 * Obtient l'URL de base de l'application
 */
export function getBaseUrl(): string {
  // En production sur Vercel
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL;
  }

  // Vercel URL automatique
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // Développement local
  return 'http://localhost:3000';
}

/**
 * Classe utilitaire pour la combinaison de classes CSS (comme clsx)
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
