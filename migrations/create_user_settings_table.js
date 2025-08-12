exports.up = function (knex) {
    return knex.schema.hasTable('user_settings').then(exists => {
        if (!exists) {
            return knex.schema.createTable('user_settings', function (table) {
                table.integer('user_id').primary().unsigned();
                table.json('settings').nullable();
                table.foreign('user_id').references('users.id').onDelete('CASCADE');
            });
        }
    });
};
exports.down = function (knex) {
    return knex.schema.dropTableIfExists('user_settings');
};
