exports.up = function (knex) {
    return knex.schema.hasTable('users').then(exists => {
        if (!exists) {
            return knex.schema.createTable('users', function (table) {
                table.increments('id').primary();
                table.string('email', 255).notNullable().unique();
                table.string('password_hash', 255).notNullable();
                table.string('role', 50).defaultTo('user');
                table.timestamp('created_at').defaultTo(knex.fn.now());
                table.string('firstname', 255);
                table.string('lastname', 255);
                table.string('plan', 50).defaultTo('free');
                table.string('api_key', 255).unique();
                table.integer('api_call_count').defaultTo(0);
                table.datetime('api_call_reset_date');
                table.timestamp('last_login');
                table.boolean('deleted').defaultTo(false);
                table.boolean('notifications').defaultTo(false);
                table.string('next_plan', 50);
                table.date('plan_change_date');
                table.date('plan_start_date');
                table.date('plan_end_date');
                table.string('avatar', 255);
                table.datetime('deleted_at');
                table.integer('remaining_credits');
            });
        }
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('users');
};
