import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserPreferences } from './entities/user-preferences.entity';
import { Pin } from './entities/pin.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';
import { CreatePinDto } from './dto/create-pin.dto';
import { UpdateObserverLocationDto } from './dto/update-observer-location.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(UserPreferences)
    private preferencesRepository: Repository<UserPreferences>,
    @InjectRepository(Pin)
    private pinsRepository: Repository<Pin>,
  ) {}

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['preferences', 'pins'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
      relations: ['preferences'],
    });
  }

  async create(email: string, passwordHash: string, name: string): Promise<User> {
    const user = this.usersRepository.create({
      email,
      passwordHash,
      name,
    });

    const savedUser = await this.usersRepository.save(user);

    // Create default preferences
    const preferences = this.preferencesRepository.create({
      userId: savedUser.id,
      mapStyle: 'dark',
      defaultZoom: 2.0,
      enabledLayers: ['terminator'],
    });

    await this.preferencesRepository.save(preferences);

    return this.findOne(savedUser.id);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    
    Object.assign(user, updateUserDto);
    await this.usersRepository.save(user);

    return this.findOne(id);
  }

  async updatePreferences(
    userId: string,
    updatePreferencesDto: UpdatePreferencesDto,
  ): Promise<UserPreferences> {
    let preferences = await this.preferencesRepository.findOne({
      where: { userId },
    });

    if (!preferences) {
      preferences = this.preferencesRepository.create({
        userId,
        ...updatePreferencesDto,
      });
    } else {
      Object.assign(preferences, updatePreferencesDto);
    }

    return this.preferencesRepository.save(preferences);
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.usersRepository.update(userId, {
      lastLogin: new Date(),
    });
  }

  // Pin management
  async createPin(userId: string, createPinDto: CreatePinDto): Promise<Pin> {
    const pin = this.pinsRepository.create({
      userId,
      ...createPinDto,
    });

    return this.pinsRepository.save(pin);
  }

  async getPins(userId: string): Promise<Pin[]> {
    return this.pinsRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async deletePin(userId: string, pinId: string): Promise<void> {
    const result = await this.pinsRepository.delete({
      id: pinId,
      userId, // Ensure user owns this pin
    });

    if (result.affected === 0) {
      throw new NotFoundException(`Pin with ID ${pinId} not found`);
    }
  }

  // Observer location management
  async updateObserverLocation(
    userId: string,
    updateObserverLocationDto: UpdateObserverLocationDto,
  ): Promise<UserPreferences> {
    let preferences = await this.preferencesRepository.findOne({
      where: { userId },
    });

    if (!preferences) {
      preferences = this.preferencesRepository.create({ userId });
    }

    preferences.observerName = updateObserverLocationDto.name || null;
    preferences.observerLatitude = updateObserverLocationDto.latitude;
    preferences.observerLongitude = updateObserverLocationDto.longitude;
    preferences.observerAltitude = updateObserverLocationDto.altitude || null;

    return this.preferencesRepository.save(preferences);
  }

  async getObserverLocation(userId: string): Promise<{
    name: string | null;
    latitude: number | null;
    longitude: number | null;
    altitude: number | null;
  }> {
    const preferences = await this.preferencesRepository.findOne({
      where: { userId },
    });

    if (!preferences) {
      return { name: null, latitude: null, longitude: null, altitude: null };
    }

    return {
      name: preferences.observerName,
      latitude: preferences.observerLatitude,
      longitude: preferences.observerLongitude,
      altitude: preferences.observerAltitude,
    };
  }

  // Favorite satellites management
  async addFavoriteSatellite(userId: string, noradId: number): Promise<UserPreferences> {
    let preferences = await this.preferencesRepository.findOne({
      where: { userId },
    });

    if (!preferences) {
      preferences = this.preferencesRepository.create({ userId });
    }

    const favorites = preferences.favoriteSatellites || [];
    if (!favorites.includes(noradId)) {
      favorites.push(noradId);
      preferences.favoriteSatellites = favorites;
      await this.preferencesRepository.save(preferences);
    }

    return preferences;
  }

  async removeFavoriteSatellite(userId: string, noradId: number): Promise<UserPreferences> {
    let preferences = await this.preferencesRepository.findOne({
      where: { userId },
    });

    if (!preferences) {
      throw new NotFoundException('User preferences not found');
    }

    const favorites = preferences.favoriteSatellites || [];
    preferences.favoriteSatellites = favorites.filter((id) => id !== noradId);

    return this.preferencesRepository.save(preferences);
  }

  async getFavoriteSatellites(userId: string): Promise<number[]> {
    const preferences = await this.preferencesRepository.findOne({
      where: { userId },
    });

    return preferences?.favoriteSatellites || [];
  }

  // Dashboard data
  async getDashboard(userId: string): Promise<{
    user: { name: string; email: string };
    stats: {
      totalPins: number;
      favoriteSatellites: number;
      hasObserverLocation: boolean;
    };
    recentPins: Pin[];
    observerLocation: {
      name: string | null;
      latitude: number | null;
      longitude: number | null;
    };
  }> {
    const user = await this.findOne(userId);
    const pins = await this.getPins(userId);
    const observerLocation = await this.getObserverLocation(userId);
    const favoriteSatellites = await this.getFavoriteSatellites(userId);

    return {
      user: {
        name: user.name,
        email: user.email,
      },
      stats: {
        totalPins: pins.length,
        favoriteSatellites: favoriteSatellites.length,
        hasObserverLocation: observerLocation.latitude !== null,
      },
      recentPins: pins.slice(0, 5),
      observerLocation: {
        name: observerLocation.name,
        latitude: observerLocation.latitude,
        longitude: observerLocation.longitude,
      },
    };
  }
}

