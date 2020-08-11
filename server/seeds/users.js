module.exports.seed = (knex) => knex('users').del()
  .then(() => knex('users').insert([
    { id: 1, email: 'a@a.com', first_name: 'Alex', last_name: 'Popov', password: '$2b$12$Z8TJ8u1LfIPSrOGdBUD9UemUPhIYZxT.4xroHxsbYdY0qWbX8m4s6' }, // simple
  ]));
