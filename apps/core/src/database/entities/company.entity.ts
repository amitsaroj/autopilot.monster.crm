import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index, OneToMany } from 'typeorm';
import { Contact } from './contact.entity';

@Entity('companies')
export class Company {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ nullable: true })
  domain!: string;

  @Column({ nullable: true })
  website!: string;

  @Column({ nullable: true })
  industry!: string;

  @Column({ nullable: true })
  phone!: string;

  @Column({ type: 'text', nullable: true })
  address!: string;

  @Column({ nullable: true })
  city!: string;

  @Column({ nullable: true })
  country!: string;

  @Column({ nullable: true })
  logoUrl!: string;

  @Column({ name: 'size_range', nullable: true })
  sizeRange!: string;

  @Column({ name: 'annual_revenue_range', nullable: true })
  annualRevenueRange!: string;

  @Column({ type: 'text', array: true, default: '{}' })
  tags!: string[];

  @OneToMany(() => Contact, (contact) => contact.company)
  contacts!: Contact[];

  @Column()
  @Index()
  tenantId!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
