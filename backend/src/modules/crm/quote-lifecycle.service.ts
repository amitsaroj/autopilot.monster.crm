import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';
import { Response } from 'express';

import { QuoteRepository } from './crm-support.repository';
import { Quote, QuoteStatus } from '../../database/entities/quote.entity';
import { EmailService } from '../../shared/email/email.service';
import { SendQuoteDto } from './dto/quote-lifecycle.dto';

@Injectable()
export class QuoteLifecycleService {
  constructor(
    private readonly repo: QuoteRepository,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  async findOne(tenantId: string, id: string): Promise<Quote> {
    const quote = await this.repo.findById(tenantId, id);
    if (!quote) {
      throw new NotFoundException('Quote not found');
    }
    return quote;
  }

  async send(tenantId: string, id: string, dto: SendQuoteDto): Promise<Quote> {
    const quote = await this.findOne(tenantId, id);
    if (quote.status !== QuoteStatus.DRAFT && quote.status !== QuoteStatus.SENT) {
      throw new BadRequestException('Quote cannot be sent in its current status');
    }

    const viewToken = quote.viewToken ?? randomBytes(32).toString('hex');
    const frontendUrl = this.configService.get<string>('app.frontendUrl') ?? 'http://localhost:3000';
    const viewUrl = `${frontendUrl}/crm/quotes/view/${viewToken}`;

    const html = this.buildQuoteEmailHtml(quote, viewUrl, dto.message);
    const sent = await this.emailService.sendEmail(dto.to, `Quote ${quote.number}`, html);
    if (!sent) {
      throw new BadRequestException('Failed to send quote email');
    }

    quote.status = QuoteStatus.SENT;
    quote.sentAt = new Date();
    quote.viewToken = viewToken;
    return this.repo.updateWithTenant(tenantId, id, quote);
  }

  async accept(tenantId: string, id: string): Promise<Quote> {
    const quote = await this.findOne(tenantId, id);
    if (quote.status === QuoteStatus.ACCEPTED) {
      return quote;
    }
    if (quote.status === QuoteStatus.DECLINED || quote.status === QuoteStatus.EXPIRED) {
      throw new BadRequestException('Quote cannot be accepted');
    }

    return this.repo.updateWithTenant(tenantId, id, {
      status: QuoteStatus.ACCEPTED,
      acceptedAt: new Date(),
    });
  }

  async decline(tenantId: string, id: string): Promise<Quote> {
    const quote = await this.findOne(tenantId, id);
    if (quote.status === QuoteStatus.DECLINED) {
      return quote;
    }
    if (quote.status === QuoteStatus.ACCEPTED) {
      throw new BadRequestException('Accepted quote cannot be declined');
    }

    return this.repo.updateWithTenant(tenantId, id, {
      status: QuoteStatus.DECLINED,
      declinedAt: new Date(),
    });
  }

  async getPublicView(token: string): Promise<Quote> {
    const quote = await this.repo.findByViewToken(token);
    if (!quote) {
      throw new NotFoundException('Quote not found');
    }
    if (quote.status === QuoteStatus.SENT) {
      await this.repo.updateWithTenant(quote.tenantId, quote.id, { status: QuoteStatus.VIEWED });
      quote.status = QuoteStatus.VIEWED;
    }
    return quote;
  }

  async acceptByToken(token: string): Promise<Quote> {
    const quote = await this.getPublicView(token);
    return this.accept(quote.tenantId, quote.id);
  }

  async declineByToken(token: string): Promise<Quote> {
    const quote = await this.getPublicView(token);
    return this.decline(quote.tenantId, quote.id);
  }

  async getByTokenForPdf(token: string): Promise<Quote> {
    const quote = await this.repo.findByViewToken(token);
    if (!quote) {
      throw new NotFoundException('Quote not found');
    }
    return quote;
  }

  generatePdfBuffer(quote: Quote): Buffer {
    const lines = [
      `Quote ${quote.number}`,
      `Status: ${quote.status}`,
      `Currency: ${quote.currency}`,
      `Subtotal: ${quote.subtotal}`,
      `Discount: ${quote.discountAmount}`,
      `Tax: ${quote.taxAmount}`,
      `Total: ${quote.total}`,
      '',
      'Line Items:',
      ...quote.lineItems.map(
        (item, i) =>
          `${i + 1}. ${item.description} x${item.qty} @ ${item.price} (disc ${item.discount})`,
      ),
    ];

    if (quote.notes) {
      lines.push('', `Notes: ${quote.notes}`);
    }

    return this.buildMinimalPdf(lines.join('\n'));
  }

  streamPdf(quote: Quote, res: Response): void {
    const buffer = this.generatePdfBuffer(quote);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="quote-${quote.number}.pdf"`);
    res.send(buffer);
  }

  private buildQuoteEmailHtml(quote: Quote, viewUrl: string, message?: string): string {
    return `
      <h1>Quote ${quote.number}</h1>
      <p>${message ?? 'Please review your quote below.'}</p>
      <p><strong>Total:</strong> ${quote.currency} ${quote.total}</p>
      <p><a href="${viewUrl}">View Quote</a></p>
    `;
  }

  private buildMinimalPdf(text: string): Buffer {
    const sanitized = text.replace(/[^\x20-\x7E\n]/g, '?');
    const lines = sanitized.split('\n');
    let y = 750;
    const textOps = lines
      .map((line) => {
        const escaped = line.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
        const op = `BT /F1 11 Tf 50 ${y} Td (${escaped}) Tj ET`;
        y -= 14;
        return op;
      })
      .join('\n');

    const stream = `BT\n/F1 11 Tf\n${textOps}\nET`;
    const streamLength = Buffer.byteLength(stream, 'utf8');

    const objects = [
      '1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj',
      '2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj',
      '3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>endobj',
      `4 0 obj<</Length ${streamLength}>>stream\n${stream}\nendstream\nendobj`,
      '5 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj',
    ];

    let pdf = '%PDF-1.4\n';
    const offsets: number[] = [0];
    for (const obj of objects) {
      offsets.push(Buffer.byteLength(pdf, 'utf8'));
      pdf += `${obj}\n`;
    }

    const xrefOffset = Buffer.byteLength(pdf, 'utf8');
    pdf += `xref\n0 ${objects.length + 1}\n`;
    pdf += '0000000000 65535 f \n';
    for (let i = 1; i <= objects.length; i++) {
      pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
    }
    pdf += `trailer<</Size ${objects.length + 1}/Root 1 0 R>>\nstartxref\n${xrefOffset}\n%%EOF`;

    return Buffer.from(pdf, 'utf8');
  }
}
