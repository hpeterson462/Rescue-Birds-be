const client = require('../lib/client');
// import our seed data:
const birds = require('./birds.js');
const usersData = require('./users.js');
const rescuesData = require('./rescues.js');
const { getEmoji } = require('../lib/emoji.js');

run();

async function run() {

  try {
    await client.connect();

    const users = await Promise.all(
      usersData.map(user => {
        return client.query(`
                      INSERT INTO users (email, hash)
                      VALUES ($1, $2)
                      RETURNING *;
                      `, [user.email, user.hash]);
      })
    );

    const user = users[0].rows[0];

    await Promise.all(
      rescuesData.map(rescue => {
        return client.query(`
          INSERT INTO rescues (name)
          VALUES ($1);
          `, [rescue.name]);
      })
    );

    await Promise.all(
      birds.map(bird => {
        return client.query(`
          INSERT INTO birds(name, number_of_eggs, flies, color, rescue_id)
          VALUES($1, $2, $3, $4, $5)
          RETURNING *;
        `, [bird.name, bird.number_of_eggs, bird.flies, bird.color, bird.rescue_id]);
      })
    );


    console.log('seed data load complete', getEmoji(), getEmoji(), getEmoji());
  }
  catch (err) {
    console.log(err);
  }
  finally {
    client.end();
  }

}
