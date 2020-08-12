const client = require('../lib/client');
// import our seed data:
const birdsData = require('./birds.js');
const { getEmoji } = require('../lib/emoji.js');

run();

async function run() {

  try {
    await client.connect();

    const birds = await Promise.all(
      birdsData.map(bird => {
        return client.query(`
                      INSERT INTO birds (name, number_of_eggs, flies, title)
                      VALUES ($1, $2, $3, $4);
                  `,
          [bird.name, bird.number_of_eggs, bird.flies, bird.title]);
      })
    );

    const bird = birds[0].rows[0];

    console.log('seed data load complete', getEmoji(), getEmoji(), getEmoji());
  }
  catch (err) {
    console.log(err);
  }
  finally {
    client.end();
  }

}
