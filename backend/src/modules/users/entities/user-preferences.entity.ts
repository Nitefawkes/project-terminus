import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('user_preferences')
export class UserPreferences {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'map_style', default: 'dark' })
  mapStyle: string;

  @Column({ name: 'default_zoom', type: 'decimal', precision: 4, scale: 2, default: 2.0 })
  defaultZoom: number;

  @Column({ name: 'default_center', type: 'jsonb', nullable: true })
  defaultCenter: { lat: number; lng: number } | null;

  @Column({ name: 'enabled_layers', type: 'jsonb', default: [] })
  enabledLayers: string[];

  @Column({ name: 'observer_name', nullable: true })
  observerName: string | null;

  @Column({ name: 'observer_latitude', type: 'decimal', precision: 10, scale: 7, nullable: true })
  observerLatitude: number | null;

  @Column({ name: 'observer_longitude', type: 'decimal', precision: 10, scale: 7, nullable: true })
  observerLongitude: number | null;

  @Column({ name: 'observer_altitude', type: 'integer', nullable: true })
  observerAltitude: number | null;

  @Column({ name: 'favorite_satellites', type: 'jsonb', default: [] })
  favoriteSatellites: number[];

  @Column({ name: 'notification_preferences', type: 'jsonb', default: {} })
  notificationPreferences: {
    spaceWeather?: boolean;
    satellitePasses?: boolean;
    kpThreshold?: number;
  };

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToOne(() => User, (user) => user.preferences)
  @JoinColumn({ name: 'user_id' })
  user: User;
}

