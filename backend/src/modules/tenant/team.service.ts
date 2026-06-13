import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TeamGroup } from '../../database/entities/team-group.entity';
import { CreateTeamDto, UpdateTeamDto } from './dto/tenant-features.dto';

@Injectable()
export class TeamService {
  private readonly logger = new Logger(TeamService.name);

  constructor(
    @InjectRepository(TeamGroup)
    private readonly teamRepo: Repository<TeamGroup>,
  ) {}

  async create(tenantId: string, dto: CreateTeamDto): Promise<TeamGroup> {
    const team = this.teamRepo.create({
      tenantId,
      name: dto.name,
      description: dto.description,
      leaderId: dto.leaderId,
    });
    const saved = await this.teamRepo.save(team);
    this.logger.log(`Team "${dto.name}" created for tenant ${tenantId}`);
    return saved;
  }

  async findAll(tenantId: string): Promise<TeamGroup[]> {
    return this.teamRepo.find({
      where: { tenantId } as any,
      relations: ['members'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(tenantId: string, id: string): Promise<TeamGroup> {
    const team = await this.teamRepo.findOne({
      where: { id, tenantId } as any,
      relations: ['members'],
    });
    if (!team) throw new NotFoundException('Team not found');
    return team;
  }

  async update(tenantId: string, id: string, dto: UpdateTeamDto): Promise<TeamGroup> {
    const team = await this.findOne(tenantId, id);
    Object.assign(team, dto);
    return this.teamRepo.save(team);
  }

  async addMembers(tenantId: string, id: string, memberIds: string[]): Promise<TeamGroup> {
    const team = await this.findOne(tenantId, id);
    // Use query builder to add members to junction table
    await this.teamRepo
      .createQueryBuilder()
      .relation(TeamGroup, 'members')
      .of(team.id)
      .add(memberIds);
    return this.findOne(tenantId, id);
  }

  async removeMembers(tenantId: string, id: string, memberIds: string[]): Promise<TeamGroup> {
    const team = await this.findOne(tenantId, id);
    await this.teamRepo
      .createQueryBuilder()
      .relation(TeamGroup, 'members')
      .of(team.id)
      .remove(memberIds);
    return this.findOne(tenantId, id);
  }

  async remove(tenantId: string, id: string): Promise<void> {
    const team = await this.findOne(tenantId, id);
    await this.teamRepo.softRemove(team);
  }
}
