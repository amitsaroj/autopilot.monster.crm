import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class CsvService {
  private readonly logger = new Logger(CsvService.name);

  /**
   * Simple CSV parser for lead lists.
   * Expected format: firstName,lastName,phone,email
   */
  async parseLeads(csvContent: string): Promise<any[]> {
    const lines = csvContent.split(/\r?\n/).filter(line => line.trim() !== '');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const leads = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
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
}
