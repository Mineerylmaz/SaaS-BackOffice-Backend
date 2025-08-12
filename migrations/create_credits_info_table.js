exports.up = function (knex) {
    return knex.schema.hasTable('credits_info').then(exists => {
        if (!exists) {
            return knex.schema.createTable('credits_info', function (table) {
                table.increments('id').primary();
                table.integer('user_id').unsigned().nullable();
                table.text('url');
                table.datetime('timestamp').defaultTo(knex.fn.now());
                table.integer('credit_used').nullable();
                table.integer('status_code').nullable();
                table.integer('response_time_ms').nullable();
                table.text('response_body', 'longtext').nullable();
                table.text('error_message').nullable();
                table.foreign('user_id').references('users.id').onDelete('SET NULL');
            });
        }
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('credits_info');
};
