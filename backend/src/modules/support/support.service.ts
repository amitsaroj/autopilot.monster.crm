import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket, TicketStatus, TicketPriority } from '../../database/entities/ticket.entity';
import { Article, ArticleStatus } from '../../database/entities/article.entity';

@Injectable()
export class SupportService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,
  ) {}

  // --- Tickets ---
  async findAll(tenantId: string) {
    return this.ticketRepository.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const ticket = await this.ticketRepository.findOne({
      where: { id, tenantId },
    });
    if (!ticket) throw new NotFoundException('Ticket artifact not found');
    return ticket;
  }

  async create(tenantId: string, dto: any) {
    const ticketNumber = `TKT-${Date.now().toString().slice(-6)}`;
    const ticket = this.ticketRepository.create({
      ...dto,
      tenantId,
      ticketNumber,
      status: TicketStatus.OPEN,
    });
    return this.ticketRepository.save(ticket);
  }

  async update(tenantId: string, id: string, dto: any) {
    const ticket = await this.findOne(tenantId, id);
    Object.assign(ticket, dto);
    return this.ticketRepository.save(ticket);
  }

  async remove(tenantId: string, id: string) {
    const ticket = await this.findOne(tenantId, id);
    return this.ticketRepository.remove(ticket);
  }

  async getStats(tenantId: string) {
     const tickets = await this.findAll(tenantId);
     return {
        total: tickets.length,
        open: tickets.filter(t => t.status === TicketStatus.OPEN).length,
        resolved: tickets.filter(t => t.status === TicketStatus.RESOLVED).length,
        urgent: tickets.filter(t => t.priority === TicketPriority.URGENT).length,
     };
  }

  // --- Knowledge Base (Articles) ---
  async findAllArticles(tenantId: string) {
    return this.articleRepository.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOneArticle(tenantId: string, id: string) {
    const article = await this.articleRepository.findOne({
      where: { id, tenantId },
    });
    if (!article) throw new NotFoundException('Knowledge artifact not found');
    return article;
  }

  async createArticle(tenantId: string, dto: any) {
    const slug = dto.title.toLowerCase().replace(/ /g, '-');
    const article = this.articleRepository.create({
      ...dto,
      tenantId,
      slug,
      status: ArticleStatus.DRAFT,
    });
    return this.articleRepository.save(article);
  }

  async updateArticle(tenantId: string, id: string, dto: any) {
    const article = await this.findOneArticle(tenantId, id);
    Object.assign(article, dto);
    return this.articleRepository.save(article);
  }

  async removeArticle(tenantId: string, id: string) {
    const article = await this.findOneArticle(tenantId, id);
    return this.articleRepository.remove(article);
  }
}
