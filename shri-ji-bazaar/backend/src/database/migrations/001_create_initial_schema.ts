import knex from 'knex';

/**
 * Migration: Create initial schema and all tables
 */

export async function up(knex: knex.Knex): Promise<void> {
  // Enable UUID extension
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

  // ==================== USERS TABLE ====================
  await knex.schema.createTable('users', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('name', 100).notNullable();
    table.string('mobile', 15).notNullable().unique();
    table.string('email', 100).unique();
    table.string('password_hash', 255).notNullable();
    table.string('avatar');
    table.string('referral_code', 20).unique().notNullable();
    table.string('referred_by', 20);
    table.enum('status', ['active', 'inactive', 'suspended']).defaultTo('active');
    table.timestamp('last_login');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.index(['mobile']);
    table.index(['referral_code']);
    table.index(['status']);
    table.index(['created_at']);
  });

  // ==================== ADMINS TABLE ====================
  await knex.schema.createTable('admins', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('name', 100).notNullable();
    table.string('email', 100).notNullable().unique();
    table.string('password_hash', 255).notNullable();
    table.enum('role', ['super_admin', 'admin', 'support', 'content_manager']).defaultTo('admin');
    table.enum('status', ['active', 'inactive', 'suspended']).defaultTo('active');
    table.timestamp('last_login');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.index(['email']);
    table.index(['role']);
  });

  // ==================== GAMES TABLE ====================
  await knex.schema.createTable('games', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('name', 100).notNullable();
    table.string('slug', 100).notNullable().unique();
    table.text('description');
    table.string('image');
    table.string('opening_time', 10); // HH:MM format
    table.string('closing_time', 10); // HH:MM format
    table.string('result_time', 10); // HH:MM format
    table.enum('status', ['active', 'inactive', 'maintenance']).defaultTo('active');
    table.boolean('is_popular').defaultTo(false);
    table.integer('sort_order').defaultTo(0);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.index(['slug']);
    table.index(['status']);
    table.index(['is_popular']);
  });

  // ==================== GAME_ROUNDS TABLE ====================
  await knex.schema.createTable('game_rounds', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('game_id').notNullable().references('id').inTable('games').onDelete('CASCADE');
    table.string('round_number', 50).notNullable();
    table.timestamp('start_time').notNullable();
    table.timestamp('end_time').notNullable();
    table.string('result');
    table.enum('status', ['open', 'closed', 'result_declared']).defaultTo('open');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.unique(['game_id', 'round_number']);
    table.index(['game_id', 'status']);
    table.index(['status']);
    table.index(['start_time']);
  });

  // ==================== PLAYS TABLE ====================
  await knex.schema.createTable('plays', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.uuid('game_id').notNullable().references('id').inTable('games');
    table.uuid('round_id').notNullable().references('id').inTable('game_rounds');
    table.string('idempotency_key', 100).notNullable();
    table.string('play_type', 30).notNullable(); // single, jodi, panel, double
    table.string('selection', 50).notNullable();
    table.integer('points').notNullable();
    table.string('result');
    table.enum('status', ['pending', 'won', 'lost', 'cancelled']).defaultTo('pending');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.unique(['user_id', 'round_id', 'play_type', 'selection']);
    table.index(['user_id']);
    table.index(['game_id']);
    table.index(['round_id']);
    table.index(['status']);
    table.index(['created_at']);
    table.index(['idempotency_key']);
  });

  // ==================== POINT_WALLETS TABLE ====================
  await knex.schema.createTable('point_wallets', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('user_id').notNullable().unique().references('id').inTable('users').onDelete('CASCADE');
    table.integer('balance').notNullable().defaultTo(0);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.index(['user_id']);
  });

  // ==================== POINT_TRANSACTIONS TABLE ====================
  await knex.schema.createTable('point_transactions', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('type', 30).notNullable(); // credit, debit, bonus, referral, reward
    table.integer('amount').notNullable();
    table.integer('balance_before').notNullable();
    table.integer('balance_after').notNullable();
    table.string('reference_id');
    table.string('reference_type'); // play, bonus, referral, reward, admin_adjustment
    table.string('description', 255);
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.index(['user_id']);
    table.index(['type']);
    table.index(['reference_type', 'reference_id']);
    table.index(['created_at']);
  });

  // ==================== BONUSES TABLE ====================
  await knex.schema.createTable('bonuses', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('name', 100).notNullable();
    table.string('slug', 100).notNullable().unique();
    table.text('description');
    table.integer('points').notNullable();
    table.enum('type', ['daily', 'weekly', 'login', 'achievement', 'referral', 'special']).notNullable();
    table.enum('status', ['active', 'inactive', 'expired']).defaultTo('active');
    table.timestamp('start_date');
    table.timestamp('end_date');
    table.jsonb('rules');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.index(['slug']);
    table.index(['type']);
    table.index(['status']);
  });

  // ==================== BONUS_CLAIMS TABLE ====================
  await knex.schema.createTable('bonus_claims', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.uuid('bonus_id').notNullable().references('id').inTable('bonuses').onDelete('CASCADE');
    table.integer('points').notNullable();
    table.timestamp('claimed_at').defaultTo(knex.fn.now());

    table.unique(['user_id', 'bonus_id']);
    table.index(['user_id']);
    table.index(['bonus_id']);
    table.index(['claimed_at']);
  });

  // ==================== REFERRALS TABLE ====================
  await knex.schema.createTable('referrals', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('referrer_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.uuid('referred_user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.integer('points').notNullable();
    table.enum('status', ['pending', 'completed', 'cancelled']).defaultTo('pending');
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.index(['referrer_id']);
    table.index(['referred_user_id']);
    table.unique(['referrer_id', 'referred_user_id']);
  });

  // ==================== NOTIFICATIONS TABLE ====================
  await knex.schema.createTable('notifications', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.string('title', 200).notNullable();
    table.text('message').notNullable();
    table.string('image');
    table.enum('type', ['game', 'result', 'bonus', 'referral', 'system', 'support']).notNullable();
    table.string('deep_link');
    table.boolean('is_read').defaultTo(false);
    table.timestamp('scheduled_at');
    table.enum('status', ['draft', 'scheduled', 'sent', 'failed']).defaultTo('draft');
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.index(['user_id']);
    table.index(['type']);
    table.index(['is_read']);
    table.index(['status']);
    table.index(['created_at']);
  });

  // ==================== SUPPORT_TICKETS TABLE ====================
  await knex.schema.createTable('support_tickets', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('subject', 200).notNullable();
    table.enum('category', ['general', 'technical', 'points', 'game', 'other']).notNullable();
    table.text('description').notNullable();
    table.string('attachment');
    table.enum('status', ['open', 'in_progress', 'waiting', 'resolved', 'closed']).defaultTo('open');
    table.enum('priority', ['low', 'medium', 'high', 'urgent']).defaultTo('medium');
    table.timestamp('resolved_at');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.index(['user_id']);
    table.index(['status']);
    table.index(['priority']);
    table.index(['created_at']);
  });

  // ==================== SUPPORT_MESSAGES TABLE ====================
  await knex.schema.createTable('support_messages', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('ticket_id').notNullable().references('id').inTable('support_tickets').onDelete('CASCADE');
    table.uuid('sender_id').notNullable();
    table.enum('sender_type', ['user', 'admin']).notNullable();
    table.text('message').notNullable();
    table.string('attachment');
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.index(['ticket_id']);
    table.index(['created_at']);
  });

  // ==================== BANNERS TABLE ====================
  await knex.schema.createTable('banners', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('title', 200).notNullable();
    table.string('image').notNullable();
    table.text('description');
    table.string('action', 50); // navigate, deep_link, web
    table.string('action_value');
    table.enum('status', ['active', 'inactive']).defaultTo('active');
    table.integer('sort_order').defaultTo(0);
    table.timestamp('start_date');
    table.timestamp('end_date');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.index(['status']);
    table.index(['sort_order']);
  });

  // ==================== SETTINGS TABLE ====================
  await knex.schema.createTable('settings', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.string('key', 100).notNullable().unique();
    table.text('value');
    table.string('type', 30).defaultTo('string'); // string, number, boolean, json
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    table.index(['key']);
  });

  // ==================== AUDIT_LOGS TABLE ====================
  await knex.schema.createTable('audit_logs', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('admin_id').references('id').inTable('admins').onDelete('SET NULL');
    table.string('action', 100).notNullable(); // create, update, delete, login, etc.
    table.string('entity', 100).notNullable(); // users, games, results, etc.
    table.string('entity_id');
    table.jsonb('metadata');
    table.string('ip_address', 45);
    table.string('user_agent');
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.index(['admin_id']);
    table.index(['entity', 'entity_id']);
    table.index(['action']);
    table.index(['created_at']);
  });

  // ==================== REFRESH_TOKENS TABLE ====================
  await knex.schema.createTable('refresh_tokens', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('token', 500).notNullable().unique();
    table.timestamp('expires_at').notNullable();
    table.boolean('is_revoked').defaultTo(false);
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.index(['user_id']);
    table.index(['token']);
  });
}

export async function down(knex: knex.Knex): Promise<void> {
  await knex.schema.dropTableIfExists('refresh_tokens');
  await knex.schema.dropTableIfExists('audit_logs');
  await knex.schema.dropTableIfExists('settings');
  await knex.schema.dropTableIfExists('banners');
  await knex.schema.dropTableIfExists('support_messages');
  await knex.schema.dropTableIfExists('support_tickets');
  await knex.schema.dropTableIfExists('notifications');
  await knex.schema.dropTableIfExists('referrals');
  await knex.schema.dropTableIfExists('bonus_claims');
  await knex.schema.dropTableIfExists('bonuses');
  await knex.schema.dropTableIfExists('point_transactions');
  await knex.schema.dropTableIfExists('point_wallets');
  await knex.schema.dropTableIfExists('plays');
  await knex.schema.dropTableIfExists('game_rounds');
  await knex.schema.dropTableIfExists('games');
  await knex.schema.dropTableIfExists('admins');
  await knex.schema.dropTableIfExists('users');
}
