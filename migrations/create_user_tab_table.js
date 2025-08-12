exports.up = function (knex) {
    return knex.schema.hasTable('user_tab').then(exists => {
        if (!exists) {
            return knex.schema.createTable('user_tab', function (table) {
                table.increments('id').primary();
                table.integer('user_id').unsigned().nullable();
                table.string('key_name', 255).nullable();
                table.text('value').nullable();
                table.foreign('user_id').references('users.id').onDelete('SET NULL');
            });
        }
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('user_tab');
};
