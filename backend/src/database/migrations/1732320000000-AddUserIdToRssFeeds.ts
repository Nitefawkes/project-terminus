import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey, TableIndex } from 'typeorm';

export class AddUserIdToRssFeeds1732320000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add user_id column (nullable initially to allow for data migration)
    await queryRunner.addColumn(
      'rss_feeds',
      new TableColumn({
        name: 'user_id',
        type: 'uuid',
        isNullable: true, // Temporarily nullable
      }),
    );

    // TODO: Data migration strategy
    // If there are existing feeds, you need to assign them to users.
    // Options:
    // 1. Assign to a default/admin user
    // 2. Delete orphaned feeds
    // 3. Use application-specific logic
    //
    // Example: Assign all existing feeds to the first user
    // const users = await queryRunner.query('SELECT id FROM users LIMIT 1');
    // if (users.length > 0) {
    //   await queryRunner.query(
    //     `UPDATE rss_feeds SET user_id = '${users[0].id}' WHERE user_id IS NULL`,
    //   );
    // }
    //
    // For now, we'll delete any feeds without a user (should be none in clean setup)
    await queryRunner.query('DELETE FROM rss_feeds WHERE user_id IS NULL');

    // Make the column non-nullable
    await queryRunner.changeColumn(
      'rss_feeds',
      'user_id',
      new TableColumn({
        name: 'user_id',
        type: 'uuid',
        isNullable: false,
      }),
    );

    // Add foreign key constraint with CASCADE delete
    await queryRunner.createForeignKey(
      'rss_feeds',
      new TableForeignKey({
        name: 'FK_rss_feeds_user',
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );

    // Add index for better query performance
    await queryRunner.createIndex(
      'rss_feeds',
      new TableIndex({
        name: 'IDX_rss_feeds_user_id',
        columnNames: ['user_id'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove index
    await queryRunner.dropIndex('rss_feeds', 'IDX_rss_feeds_user_id');

    // Remove foreign key
    await queryRunner.dropForeignKey('rss_feeds', 'FK_rss_feeds_user');

    // Remove column
    await queryRunner.dropColumn('rss_feeds', 'user_id');
  }
}
