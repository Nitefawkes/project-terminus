import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class AddSavedSearches1732340000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create saved_searches table
    await queryRunner.createTable(
      new Table({
        name: 'saved_searches',
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
            name: 'filters',
            type: 'jsonb',
            isNullable: false,
          },
          {
            name: 'isDefault',
            type: 'boolean',
            default: false,
          },
          {
            name: 'isPinned',
            type: 'boolean',
            default: false,
          },
          {
            name: 'sortOrder',
            type: 'int',
            default: 0,
          },
          {
            name: 'last_used_at',
            type: 'timestamp',
            isNullable: true,
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
      'saved_searches',
      new TableForeignKey({
        name: 'FK_saved_searches_user',
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );

    // Add indexes
    await queryRunner.createIndex(
      'saved_searches',
      new TableIndex({
        name: 'IDX_saved_searches_user_id',
        columnNames: ['user_id'],
      }),
    );

    await queryRunner.createIndex(
      'saved_searches',
      new TableIndex({
        name: 'IDX_saved_searches_user_default',
        columnNames: ['user_id', 'isDefault'],
      }),
    );

    await queryRunner.createIndex(
      'saved_searches',
      new TableIndex({
        name: 'IDX_saved_searches_user_pinned',
        columnNames: ['user_id', 'isPinned'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.dropIndex('saved_searches', 'IDX_saved_searches_user_pinned');
    await queryRunner.dropIndex('saved_searches', 'IDX_saved_searches_user_default');
    await queryRunner.dropIndex('saved_searches', 'IDX_saved_searches_user_id');

    // Drop foreign key
    await queryRunner.dropForeignKey('saved_searches', 'FK_saved_searches_user');

    // Drop table
    await queryRunner.dropTable('saved_searches');
  }
}
