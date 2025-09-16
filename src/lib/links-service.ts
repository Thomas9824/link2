// Service partagé pour gérer les liens raccourcis
export interface LinkData {
  id: string;
  originalUrl: string;
  shortCode: string;
  createdAt: Date;
  clicks: number;
}

// Base de données temporaire en mémoire (à remplacer par une vraie DB plus tard)
// Utilisation d'un singleton pour s'assurer que la même instance est partagée
class LinksDatabase {
  private static instance: LinksDatabase;
  private linksMap: Map<string, LinkData>;

  private constructor() {
    this.linksMap = new Map<string, LinkData>();
  }

  public static getInstance(): LinksDatabase {
    if (!LinksDatabase.instance) {
      LinksDatabase.instance = new LinksDatabase();
    }
    return LinksDatabase.instance;
  }

  public set(key: string, value: LinkData): void {
    this.linksMap.set(key, value);
  }

  public get(key: string): LinkData | undefined {
    return this.linksMap.get(key);
  }

  public has(key: string): boolean {
    return this.linksMap.has(key);
  }

  public delete(key: string): boolean {
    return this.linksMap.delete(key);
  }

  public values(): IterableIterator<LinkData> {
    return this.linksMap.values();
  }
}

const linksDB = LinksDatabase.getInstance();

export class LinksService {
  static createLink(url: string, shortCode: string): LinkData {
    const linkData: LinkData = {
      id: crypto.randomUUID(),
      originalUrl: url,
      shortCode,
      createdAt: new Date(),
      clicks: 0
    };

    linksDB.set(shortCode, linkData);
    console.log(`🔗 Lien créé: ${shortCode} -> ${url}`);
    return linkData;
  }

  static getLink(shortCode: string): LinkData | undefined {
    const link = linksDB.get(shortCode);
    console.log(`🔍 Recherche du lien ${shortCode}:`, link ? 'trouvé' : 'non trouvé');
    return link;
  }

  static getAllLinks(): LinkData[] {
    const links = Array.from(linksDB.values());
    console.log(`📋 Récupération de ${links.length} liens`);
    return links;
  }

  static deleteLink(shortCode: string): boolean {
    const deleted = linksDB.delete(shortCode);
    console.log(`🗑️ Suppression du lien ${shortCode}:`, deleted ? 'succès' : 'échec');
    return deleted;
  }

  static incrementClicks(shortCode: string): boolean {
    const link = linksDB.get(shortCode);
    if (link) {
      link.clicks += 1;
      console.log(`📈 Clics incrémentés pour ${shortCode}: ${link.clicks}`);
      return true;
    }
    console.log(`❌ Impossible d'incrémenter les clics pour ${shortCode}: lien non trouvé`);
    return false;
  }

  static linkExists(shortCode: string): boolean {
    const exists = linksDB.has(shortCode);
    console.log(`🔎 Vérification existence ${shortCode}:`, exists);
    return exists;
  }

  static debug(): void {
    console.log('🐛 Debug LinksService:');
    console.log('Nombre de liens:', Array.from(linksDB.values()).length);
    Array.from(linksDB.values()).forEach(link => {
      console.log(`  - ${link.shortCode}: ${link.originalUrl} (${link.clicks} clics)`);
    });
  }
}
