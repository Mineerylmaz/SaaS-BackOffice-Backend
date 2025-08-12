exports.up = function (knex) {
    return knex.schema.hasTable('invites').then(exists => {
        if (!exists) {
            return knex.schema.createTable('invites', function (table) {
                table.increments('id').primary();
                table.string('token', 36).notNullable().unique();
                table.integer('inviter_user_id').notNullable().unsigned();
                table.string('email', 255).notNullable();
                table.string('role', 50).notNullable();
                table.enu('status', ['pending', 'accepted']).defaultTo('pending');
                table.timestamp('invited_at').defaultTo(knex.fn.now());
                table.timestamp('accepted_at').nullable();
                table.string('inviterEmail', 255);
                table.foreign('inviter_user_id').references('users.id').onDelete('CASCADE');
            });
        }
    });
};
exports.down = function (knex) {
    return knex.schema.dropTableIfExists('invites');
};
