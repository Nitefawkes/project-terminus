import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { RSSItem } from './rss-item.entity';

export enum FeedType {
  NEWS = 'news',
  SECURITY = 'security',
  DISASTER = 'disaster',
  MARITIME = 'maritime',
  AVIATION = 'aviation',
  CONFLICT = 'conflict',
  ECONOMICS = 'economics',
  SCIENCE = 'science',
  HEALTH = 'health',
  CUSTOM = 'custom',
}

@Entity('rss_feeds')
export class RSSFeed {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  url: string;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: FeedType,
    default: FeedType.CUSTOM,
  })
  type: FeedType;

  @Column()
  subtype: string;

  @Column({ default: true })
  enabled: boolean;

  @Column({ name: 'refresh_interval', default: 15 })
  refreshInterval: number; // in minutes

  @Column({ name: 'geocoding_enabled', default: true })
  geocodingEnabled: boolean;

  @Column({ name: 'last_fetched', nullable: true })
  lastFetched: Date;

  @Column({ name: 'last_error', nullable: true, type: 'text' })
  lastError: string;

  @Column({ name: 'item_count', default: 0 })
  itemCount: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => RSSItem, (item) => item.feed)
  items: RSSItem[];
}
