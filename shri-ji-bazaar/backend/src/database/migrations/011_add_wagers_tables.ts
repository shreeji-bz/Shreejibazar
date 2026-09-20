import knex from 'knex';

export async function up(knex: knex.Knex): Promise<void> {
  // ==================== WAGER_TYPES TABLE ====================
  await knex.schema.createTable('wager_types', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('game_id').notNullable().references('id').inTable('games').onDelete('CASCADE');
    table.string('name', 100).notNullable();
    table.string('slug', 100).notNullable();
    table.text('description');
    table.decimal('payout_multiplier', 5, 2).notNullable().defaultTo(1.8);
    table.integer('min_points').notNullable().defaultTo(10);
    table.integer('max_points').notNullable().defaultTo(1000);
    table.enum('status', ['active', 'inactive']).defaultTo('active');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.unique(['game_id', 'slug']);
    table.index(['game_id', 'status']);
  });

  // ==================== WAGERS TABLE ====================
  await knex.schema.createTable('wagers', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.uuid('game_id').notNullable().references('id').inTable('games');
    table.uuid('round_id').notNullable().references('id').inTable('game_rounds');
    table.uuid('wager_type_id').references('id').inTable('wager_types');
    table.string('play_type', 30).notNullable();
    table.string('selection', 50).notNullable();
    table.integer('points_staked').notNullable();
    table.integer('potential_payout').notNullable();
    table.enum('status', ['pending', 'active', 'won', 'lost', 'void']).defaultTo('pending');
    table.string('result_status', 30).defaultTo('pending');
    table.string('result_text');
    table.integer('points_won').defaultTo(0);
    table.integer('points_refunded').defaultTo(0);
    table.string('idempotency_key', 100);
    table.timestamp('placed_at');
    table.timestamp('settled_at');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.unique(['user_id', 'round_id', 'play_type', 'selection']);
    table.index(['user_id', 'created_at']);
    table.index(['game_id', 'status']);
    table.index(['round_id', 'status']);
    table.index(['status']);
    table.index(['idempotency_key']);
  });
}

export async function down(knex: knex.Knex): Promise<void> {
  await knex.schema.dropTableIfExists('wagers');
  await knex.schema.dropTableIfExists('wager_types');
}
