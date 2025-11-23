import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { RSSFeed } from './rss-feed.entity';

@Entity('feed_collections')
export class FeedCollection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 50, nullable: true })
  color: string; // Hex color for UI (#FF5733)

  @Column({ length: 50, nullable: true })
  icon: string; // Icon name for UI

  @Column({ type: 'boolean', default: false })
  isDefault: boolean; // Auto-load on login

  @Column({ type: 'int', default: 0 })
  sortOrder: number; // Display order

  @ManyToMany(() => RSSFeed)
  @JoinTable({
    name: 'feed_collection_memberships',
    joinColumn: { name: 'collection_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'feed_id', referencedColumnName: 'id' },
  })
  feeds: RSSFeed[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
