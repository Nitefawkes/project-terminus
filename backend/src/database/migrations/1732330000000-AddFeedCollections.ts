import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class AddFeedCollections1732330000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create feed_collections table
    await queryRunner.createTable(
      new Table({
        name: 'feed_collections',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'color',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'icon',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'isDefault',
            type: 'boolean',
            default: false,
          },
          {
            name: 'sortOrder',
            type: 'int',
            default: 0,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Add foreign key to users
    await queryRunner.createForeignKey(
      'feed_collections',
      new TableForeignKey({
        name: 'FK_feed_collections_user',
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );

    // Add indexes
    await queryRunner.createIndex(
      'feed_collections',
      new TableIndex({
        name: 'IDX_feed_collections_user_id',
        columnNames: ['user_id'],
      }),
    );

    await queryRunner.createIndex(
      'feed_collections',
      new TableIndex({
        name: 'IDX_feed_collections_user_default',
        columnNames: ['user_id', 'isDefault'],
      }),
    );

    // Create feed_collection_memberships junction table
    await queryRunner.createTable(
      new Table({
        name: 'feed_collection_memberships',
        columns: [
          {
            name: 'collection_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'feed_id',
            type: 'uuid',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    // Add composite primary key
    await queryRunner.query(
      `ALTER TABLE feed_collection_memberships ADD CONSTRAINT "PK_feed_collection_memberships" PRIMARY KEY ("collection_id", "feed_id")`,
    );

    // Add foreign keys
    await queryRunner.createForeignKey(
      'feed_collection_memberships',
      new TableForeignKey({
        name: 'FK_collection_memberships_collection',
        columnNames: ['collection_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'feed_collections',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'feed_collection_memberships',
      new TableForeignKey({
        name: 'FK_collection_memberships_feed',
        columnNames: ['feed_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'rss_feeds',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );

    // Add indexes for performance
    await queryRunner.createIndex(
      'feed_collection_memberships',
      new TableIndex({
        name: 'IDX_collection_memberships_collection',
        columnNames: ['collection_id'],
      }),
    );

    await queryRunner.createIndex(
      'feed_collection_memberships',
      new TableIndex({
        name: 'IDX_collection_memberships_feed',
        columnNames: ['feed_id'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop feed_collection_memberships table
    await queryRunner.dropIndex(
      'feed_collection_memberships',
      'IDX_collection_memberships_feed',
    );
    await queryRunner.dropIndex(
      'feed_collection_memberships',
      'IDX_collection_memberships_collection',
    );
    await queryRunner.dropForeignKey(
      'feed_collection_memberships',
      'FK_collection_memberships_feed',
    );
    await queryRunner.dropForeignKey(
      'feed_collection_memberships',
      'FK_collection_memberships_collection',
    );
    await queryRunner.dropTable('feed_collection_memberships');

    // Drop feed_collections table
    await queryRunner.dropIndex(
      'feed_collections',
      'IDX_feed_collections_user_default',
    );
    await queryRunner.dropIndex('feed_collections', 'IDX_feed_collections_user_id');
    await queryRunner.dropForeignKey('feed_collections', 'FK_feed_collections_user');
    await queryRunner.dropTable('feed_collections');
  }
}
