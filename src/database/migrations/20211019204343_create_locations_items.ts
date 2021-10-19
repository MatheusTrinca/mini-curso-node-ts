import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('locations_items', table => {
    table.increments('id').primary();
    table
      .string('location_id')
      .notNullable()
      .references('id')
      .inTable('locations');
    table.string('item_id').notNullable().references('id').inTable('items');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('locations_items');
}