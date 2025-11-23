import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { RSSFeed } from './rss-feed.entity';

@Entity('rss_items')
@Index(['feedId', 'pubDate'])
@Index(['geocoded'])
export class RSSItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'feed_id' })
  feedId: string;

  @Column({ type: 'text' })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text' })
  link: string;

  @Column({ name: 'pub_date' })
  pubDate: Date;

  @Column({ unique: true })
  guid: string;

  @Column({ nullable: true })
  author: string;

  // Geolocation
  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude: number;

  @Column({ nullable: true })
  location: string;

  @Column({ default: false })
  geocoded: boolean;

  // Metadata
  @Column({ type: 'simple-array', nullable: true })
  categories: string[];

  @Column({ type: 'text', nullable: true })
  imageUrl: string;

  @Column({ type: 'text', nullable: true })
  contentSnippet: string;

  // User interaction
  @Column({ default: false })
  read: boolean;

  @Column({ default: false })
  starred: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => RSSFeed, (feed) => feed.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'feed_id' })
  feed: RSSFeed;
}
