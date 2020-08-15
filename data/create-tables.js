const client = require('../lib/client');
const { getEmoji } = require('../lib/emoji.js');

// async/await needs to run in a function
run();

async function run() {

  try {
    // initiate connecting to db
    await client.connect();

    // run a query to create tables
    await client.query(`
                CREATE TABLE users (
                  id SERIAL PRIMARY KEY,
                  email VARCHAR(256) NOT NULL,
                  hash VARCHAR(512) NOT NULL
                );
                CREATE TABLE rescues (
                  id SERIAL PRIMARY KEY NOT NULL,
                  name VARCHAR(256) NOT NULL
                );
                 CREATE TABLE birds (
                    id SERIAL PRIMARY KEY NOT NULL,
                    name VARCHAR(512) NOT NULL,
                    number_of_eggs INTEGER NOT NULL,
                    flies BOOLEAN NOT NULL,
                    color VARCHAR(512) NOT NULL,
                    rescue_id INTEGER NOT NULL REFERENCES rescues(id)
                  );  
        `);

    console.log('create tables complete', getEmoji(), getEmoji(), getEmoji());
  }
  catch (err) {
    // problem? let's see the error...
    console.log(err);
  }
  finally {
    // success or failure, need to close the db connection
    client.end();
  }

}
