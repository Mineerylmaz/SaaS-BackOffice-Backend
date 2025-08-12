exports.up = function (knex) {
    return knex.schema.hasTable('api_responses').then(exists => {
        if (!exists) {
            return knex.schema.createTable('api_responses', function (table) {
                table.increments('id').primary();
                table.integer('user_id').notNullable().unsigned();
                table.text('url').notNullable();
                table.text('response_body', 'longtext').notNullable();
                table.datetime('created_at').defaultTo(knex.fn.now());
                table.foreign('user_id').references('users.id').onDelete('CASCADE');
            });
        }
    });
};
exports.down = function (knex) {
    return knex.schema.dropTableIfExists('api_responses');
};
