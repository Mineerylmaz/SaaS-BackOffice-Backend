exports.up = function (knex) {
    return knex.schema.hasTable('setting_keys').then(exists => {
        if (!exists) {
            return knex.schema.createTable('setting_keys', function (table) {
                table.increments('id').primary();
                table.string('key_name', 100).notNullable().unique();
                table.enu('type', ['string', 'number']).notNullable();
                table.timestamp('created_at').defaultTo(knex.fn.now());
                table.timestamp('updated_at').defaultTo(knex.fn.now());
                table.text('description').nullable();
                table.boolean('required').defaultTo(true);
            });
        }
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('setting_keys');
};
