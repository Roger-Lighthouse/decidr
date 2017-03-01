exports.up = function(knex, Promise) {
  return knex.schema.createTable('users', function (table) {
    table.increments('id').primary();
    table.string('email');
    table.timestamp(); 
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('users');
};
