exports.up = function (knex) {
    return knex.schema.hasTable('pricing').then(exists => {
        if (!exists) {
            return knex.schema.createTable('pricing', function (table) {
                table.increments('id').primary();
                table.string('name', 100).nullable();
                table.decimal('price', 10, 2).nullable();
                table.json('features').nullable();
                table.integer('static_url_limit').defaultTo(0);
                table.integer('rt_url_limit').defaultTo(0);
                table.integer('max_file_size').defaultTo(0);
                table.text('roles').nullable();
                table.integer('credits').defaultTo(0);
                table.string('systemid', 10).nullable();
                table.json('metotlar').nullable();
            });
        }
    });
};
exports.down = function (knex) {
    return knex.schema.dropTableIfExists('pricing');
};
