import knex from 'knex';

export async function up(knex: knex.Knex): Promise<void> {
  // ==================== PAYMENTS TABLE ====================
  await knex.schema.createTable('payments', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');

    // Core fields (used by existing entity/service/repo)
    table.string('type', 50).notNullable(); // deposit | withdrawal | refund | bonus | referral | admin_credit | admin_debit | settlement
    table.integer('amount').notNullable();
    table.string('currency', 10).notNullable().defaultTo('INR');
    table.string('method', 50).notNullable(); // upi | bank_transfer | paytm | phonepe | cash | points | admin | imps
    table.string('status', 50).notNullable().defaultTo('pending'); // pending | approved | rejected | completed | failed | cancelled

    // Reference fields
    table.string('reference_id', 100);
    table.string('reference_type', 50);

    // Notes
    table.text('notes');
    table.text('admin_notes');

    // Balance tracking
    table.integer('balance_before');
    table.integer('balance_after');

    // Processing
    table.string('processed_by', 100); // admin ID or 'imb_gateway'
    table.timestamp('approved_at');
    table.timestamp('completed_at');

    // Deposit-specific: UTR / screenshot
    table.string('utr_number', 100);
    table.string('screenshot_url', 500);

    // Transaction ID for manual/IMB deposits
    table.string('txn_id', 100).unique();

    // Provider
    table.string('provider', 50).notNullable().defaultTo('manual'); // manual | razorpay | paytm | phonepe

    // Withdrawal-specific: bank details
    table.string('bank_name', 100);
    table.string('account_number', 50);
    table.string('ifsc_code', 20);
    table.string('account_holder_name', 100);

    // Rejection reason
    table.text('rejection_reason');

    // Timestamps
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
    table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable();

    table.index(['user_id']);
    table.index(['status']);
    table.index(['type']);
    table.index(['created_at']);
    table.index(['txn_id']);
  });

  // ==================== USER PAYMENT SETTINGS ====================
  await knex.schema.createTable('user_payment_settings', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE').unique();

    // Saved UPI details
    table.string('upi_id', 100);
    table.boolean('upi_verified').defaultTo(false);

    // Saved bank details
    table.string('bank_name', 100);
    table.string('account_number', 50);
    table.string('ifsc_code', 20);
    table.string('account_holder_name', 100);
    table.boolean('bank_verified').defaultTo(false);

    // Default payment method
    table.enum('default_method', ['upi', 'bank']);

    // Timestamps
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
    table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable();

    table.index(['user_id']);
  });

  // ==================== PAYMENT NOTIFICATIONS ====================
  await knex.schema.createTable('payment_notifications', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'));
    table.uuid('payment_id').notNullable().references('id').inTable('payments').onDelete('CASCADE');
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.text('message').notNullable();
    table.enum('type', [
      'deposit_request',
      'withdrawal_request',
      'deposit_approved',
      'withdrawal_approved',
      'deposit_rejected',
      'withdrawal_rejected',
    ]).notNullable();
    table.boolean('read').defaultTo(false);
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();

    table.index(['user_id']);
    table.index(['payment_id']);
    table.index(['created_at']);
  });
}

export async function down(knex: knex.Knex): Promise<void> {
  await knex.schema.dropTableIfExists('payment_notifications');
  await knex.schema.dropTableIfExists('user_payment_settings');
  await knex.schema.dropTableIfExists('payments');
}
