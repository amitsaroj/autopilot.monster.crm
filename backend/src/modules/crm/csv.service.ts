import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class CsvService {
  private readonly logger = new Logger(CsvService.name);

  /**
   * Simple CSV parser for lead lists.
   * Expected format: firstName,lastName,phone,email
   */
  async parseLeads(csvContent: string): Promise<any[]> {
    const lines = csvContent.split(/\r?\n/).filter((line) => line.trim() !== '');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
    const leads = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map((v) => v.trim());
      const lead: any = {};
      headers.forEach((header, index) => {
        lead[header] = values[index];
      });

      // Basic validation
      if (lead.phone && lead.firstname) {
        leads.push({
          firstName: lead.firstname,
          lastName: lead.lastname || '',
          phone: lead.phone,
          email: lead.email || '',
        });
      }
    }

    this.logger.log(`Parsed ${leads.length} leads from CSV`);
    return leads;
  }

  async importContacts(csvContent: string): Promise<any[]> {
    const lines = csvContent.split(/\r?\n/).filter((line) => line.trim() !== '');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
    const contacts = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map((v) => v.trim());
      const contact: any = {};
      headers.forEach((header, index) => {
        contact[header] = values[index];
      });

      if (contact.email || contact.phone) {
        contacts.push({
          firstName: contact.firstname || '',
          lastName: contact.lastname || '',
          email: contact.email || '',
          phone: contact.phone || '',
          company: contact.company || '',
        });
      }
    }

    this.logger.log(`Parsed ${contacts.length} contacts from CSV`);
    return contacts;
  }

  exportContacts(contacts: any[]): string {
    return this.generateCsv(contacts);
  }

  exportDeals(deals: any[]): string {
    return this.generateCsv(deals);
  }

  generateCsv(data: any[]): string {
    if (data.length === 0) return '';
    const headers = Object.keys(data[0]);
    const rows = data.map(obj => 
      headers.map(header => JSON.stringify(obj[header] || '')).join(',')
    );
    return [headers.join(','), ...rows].join('\n');
  }
}
