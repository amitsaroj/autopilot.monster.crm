import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum SocialPlatform {
  FACEBOOK = 'FACEBOOK',
  TWITTER = 'TWITTER',
  LINKEDIN = 'LINKEDIN',
  INSTAGRAM = 'INSTAGRAM',
}

export enum SocialPostStatus {
  DRAFT = 'DRAFT',
  SCHEDULED = 'SCHEDULED',
  POSTED = 'POSTED',
  FAILED = 'FAILED',
}

@Entity('social_posts')
export class SocialPost {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'enum', enum: SocialPlatform })
  platform!: SocialPlatform;

  @Column({ type: 'text' })
  content!: string;

  @Column({ type: 'simple-array', nullable: true })
  mediaUrls!: string[];

  @Column({ type: 'timestamp' })
  @Index()
  scheduledAt!: Date;

  @Column({ type: 'enum', enum: SocialPostStatus, default: SocialPostStatus.DRAFT })
  status!: SocialPostStatus;

  @Column({ default: 0 })
  likesCount!: number;

  @Column({ default: 0 })
  sharesCount!: number;

  @Column({ default: 0 })
  clicksCount!: number;

  @Column({ type: 'text', nullable: true })
  failReason!: string;

  @Column()
  @Index()
  tenantId!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
