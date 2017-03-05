exports.up = function(knex, Promise) {
  // We are not using increment because our project does not require
  // login credentials or cookies. So the ID's are complex strings
  return Promise.all([
    knex.schema.createTable('users', (table) => {
      // table.increments('id').primary();
      table.string('id').primary();
      table.string('email').unique();
    }),
    knex.schema.createTable('poll', (table) => {
      // table.increments('id').primary();
      table.string('id').primary();
      table.string('creator_id').unsigned();
      table.foreign('creator_id').references('users.id');
      table.string('creator_url');
      table.timestamp('created');
      table.string('question');
      table.timestamp('event');
      table.timestamp('closed');
    }),
    knex.schema.createTable('choice', (table) => {
      table.string('id').primary();
      table.string('poll_id').unsigned();
      table.foreign('poll_id').references('poll.id');
      table.string('name');
      table.string('description');
    }),
    knex.schema.createTable('invite', (table) => {
      table.string('poll_id').unsigned();
      table.foreign('poll_id').references('poll.id');
      table.string('user_id').unsigned();
      table.foreign('user_id').references('users.id');
      table.string('invite_url');
    }),
    knex.schema.createTable('selection', (table) => {
      table.string('poll_id').unsigned();
      table.foreign('poll_id').references('poll.id');
      table.string('user_id').unsigned();
      table.foreign('user_id').references('users.id');
      table.string('choice_id').unsigned();
      table.foreign('choice_id').references('choice.id');
      table.integer('rank');
    })
  ])
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTable('selection'),
    knex.schema.dropTable('invite'),
    knex.schema.dropTable('choice'),
    knex.schema.dropTable('poll'),
    knex.schema.dropTable('users')
  ])
};
