import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { getCountryFromIP } from './geolocation';

// Service partagé pour gérer les liens raccourcis avec persistance
export interface LinkData {
  id: string;
  originalUrl: string;
  shortCode: string;
  createdAt: string; // Utiliser string pour JSON
  clicks: number;
  clickHistory: ClickEvent[];
}

export interface ClickEvent {
  timestamp: string;
  userAgent?: string;
  referer?: string;
  country?: string;
  device?: string;
  browser?: string;
  ip?: string;
}

const DATA_FILE = join(process.cwd(), 'links-data.json');

// Service de liens avec persistance sur disque
export class PersistentLinksService {
  private static loadData(): Map<string, LinkData> {
    if (!existsSync(DATA_FILE)) {
      return new Map();
    }
    
    try {
      const data = readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      return new Map(Object.entries(parsed));
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      return new Map();
    }
  }

  private static saveData(linksMap: Map<string, LinkData>): void {
    try {
      const data = Object.fromEntries(linksMap);
      writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  }

  static createLink(url: string, shortCode: string): LinkData {
    const linksMap = this.loadData();
    
    const linkData: LinkData = {
      id: crypto.randomUUID(),
      originalUrl: url,
      shortCode,
      createdAt: new Date().toISOString(),
      clicks: 0,
      clickHistory: []
    };

    linksMap.set(shortCode, linkData);
    this.saveData(linksMap);
    console.log(`🔗 Lien créé et sauvé: ${shortCode} -> ${url}`);
    return linkData;
  }

  static getLink(shortCode: string): LinkData | undefined {
    const linksMap = this.loadData();
    const link = linksMap.get(shortCode);
    console.log(`🔍 Recherche du lien ${shortCode}:`, link ? 'trouvé' : 'non trouvé');
    if (link) {
      console.log(`   URL: ${link.originalUrl}, Clics: ${link.clicks}`);
      
      // Initialiser clickHistory si elle n'existe pas (pour les liens existants)
      if (!link.clickHistory) {
        link.clickHistory = [];
        // Sauvegarder la mise à jour
        linksMap.set(shortCode, link);
        this.saveData(linksMap);
      }
    }
    return link;
  }

  static getAllLinks(): LinkData[] {
    const linksMap = this.loadData();
    const links = Array.from(linksMap.values());
    
    // Initialiser clickHistory pour tous les liens qui n'en ont pas
    let needsSave = false;
    links.forEach(link => {
      if (!link.clickHistory) {
        link.clickHistory = [];
        linksMap.set(link.shortCode, link);
        needsSave = true;
      }
    });
    
    if (needsSave) {
      this.saveData(linksMap);
    }
    
    console.log(`📋 Récupération de ${links.length} liens`);
    return links;
  }

  static deleteLink(shortCode: string): boolean {
    const linksMap = this.loadData();
    const deleted = linksMap.delete(shortCode);
    if (deleted) {
      this.saveData(linksMap);
    }
    console.log(`🗑️ Suppression du lien ${shortCode}:`, deleted ? 'succès' : 'échec');
    return deleted;
  }

  static async incrementClicks(shortCode: string, clickData?: Partial<ClickEvent>): Promise<boolean> {
    const linksMap = this.loadData();
    const link = linksMap.get(shortCode);
    if (link) {
      link.clicks += 1;

      // Initialiser clickHistory si elle n'existe pas (pour les liens existants)
      if (!link.clickHistory) {
        link.clickHistory = [];
      }

      // Détecter le pays à partir de l'IP de manière asynchrone
      let country = clickData?.country || 'Unknown';
      if (clickData?.ip) {
        try {
          country = await getCountryFromIP(clickData.ip);
        } catch (error) {
          console.error('Error getting country from IP:', error);
          country = 'Unknown';
        }
      }

      // Ajouter l'événement de clic à l'historique
      const clickEvent: ClickEvent = {
        timestamp: new Date().toISOString(),
        userAgent: clickData?.userAgent,
        referer: clickData?.referer,
        country: country,
        device: this.detectDevice(clickData?.userAgent),
        browser: this.detectBrowser(clickData?.userAgent),
        ip: clickData?.ip
      };

      link.clickHistory.push(clickEvent);
      linksMap.set(shortCode, link);
      this.saveData(linksMap);
      console.log(`📈 Clics incrémentés pour ${shortCode}: ${link.clicks} (Pays: ${country})`);
      return true;
    }
    console.log(`❌ Impossible d'incrémenter les clics pour ${shortCode}: lien non trouvé`);
    return false;
  }

  private static detectDevice(userAgent?: string): string {
    if (!userAgent) return 'Unknown';
    
    if (/Mobile|Android|iPhone|iPad/.test(userAgent)) {
      if (/iPad/.test(userAgent)) return 'Tablet';
      return 'Mobile';
    }
    return 'Desktop';
  }

  private static detectBrowser(userAgent?: string): string {
    if (!userAgent) return 'Unknown';

    if (/Chrome/.test(userAgent) && !/Edge/.test(userAgent)) return 'Chrome';
    if (/Firefox/.test(userAgent)) return 'Firefox';
    if (/Safari/.test(userAgent) && !/Chrome/.test(userAgent)) return 'Safari';
    if (/Edge/.test(userAgent)) return 'Edge';
    if (/Opera/.test(userAgent)) return 'Opera';

    return 'Other';
  }


  static linkExists(shortCode: string): boolean {
    const linksMap = this.loadData();
    const exists = linksMap.has(shortCode);
    console.log(`🔎 Vérification existence ${shortCode}:`, exists);
    return exists;
  }

  static debug(): void {
    const linksMap = this.loadData();
    console.log('🐛 Debug PersistentLinksService:');
    console.log('Nombre de liens:', linksMap.size);
    console.log('Fichier de données:', DATA_FILE);
    linksMap.forEach((link, code) => {
      console.log(`  - ${code}: ${link.originalUrl} (${link.clicks} clics)`);
    });
  }
}
