exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('users', function (table) {
      table.increments('id').primary();
      table.string('email');
    }),
    knex.schema.createTable('poll', function (table) {
      table.increments('id').primary();
      table.integer('user_id');
      table.text('creator_url');
      table.date('created');
      table.date('poll-question');
      table.date('event');
    }),
    knex.schema.createTable('choice', function (table) {
      table.increments('id').primary();
      table.integer('poll_id');
      table.text('choice_name');
      table.text('choice_description');
    }),
    knex.schema.createTable('invite', function (table) {
      table.integer('poll_id');
      table.integer('user_id');
      table.text('invite_url');
    }),
    knex.schema.createTable('selection', function (table) {
      table.integer('poll_id');
      table.integer('userd_id');
      table.integer('choice_id');
      table.integer('rank');
    })
  ]) 
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTable('users'),
    knex.schema.dropTable('poll'),
    knex.schema.dropTable('choice'),
    knex.schema.dropTable('invite'),
    knex.schema.dropTable('selection')
  ])
};
