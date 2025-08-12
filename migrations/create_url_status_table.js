exports.up = function (knex) {
    return knex.schema.hasTable('url_status').then(exists => {
        if (!exists) {
            return knex.schema.createTable('url_status', function (table) {
                table.increments('id').primary();
                table.integer('user_id').unsigned().nullable();
                table.string('url', 500).nullable();
                table.enu('type', ['rt', 'static']).nullable();
                table.integer('response_time').nullable();
                table.enu('status', ['success', 'error']).nullable();
                table.datetime('checked_at').defaultTo(knex.fn.now());
                table.text('error_message').nullable();
                table.string('name', 255).nullable();
                table.foreign('user_id').references('users.id').onDelete('SET NULL');
            });
        }
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('url_status');
};
