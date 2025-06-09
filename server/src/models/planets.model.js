const fs = require("fs");
const path = require("path");
const { parse } = require("csv-parse");

const planets = require("./planets.mongo");

// This array is not being populated. If you want the count at the end to work,
// you should add `habitablePlanets.push(data);` inside the 'if' block below.

// Function to check if a planet is habitable
function isHabitablePlanet(planet) {
  return (
    planet["koi_disposition"] === "CONFIRMED" && // Planet is confirmed
    planet["koi_insol"] > 0.36 && // Stellar flux is within the habitable range
    planet["koi_insol"] < 1.11 &&
    planet["koi_prad"] < 1.6 // Planet radius is less than 1.6 Earth radii
  );
}

function loadPlanetsData() {
  // Read the file and parse the data
  return new Promise((resolve, reject) => {
    fs.createReadStream(
      path.join(__dirname, "..", "..", "data", "kepler_data.csv")
    )
      .pipe(
        parse({
          comment: "#", // Ignore lines starting with #
          columns: true, // Convert each row into a JavaScript object
        })
      )
      .on("data", async (data) => {
        // Add the planet if it meets the habitable criteria
        if (isHabitablePlanet(data)) {
          savePlanet(data);
        }
      })
      .on("error", (err) => {
        // Handle any errors that occur during the read process
        console.log("Error occurred:", err);
        reject(err);
      })
      .on("end", async () => {
        const countPlanetsFound = (await getAllPlanets()).length;
        // To get the accurate count from the database instead of the in-memory array:
        console.log(`${countPlanetsFound} Habitable Planets were found`);
        resolve();
      });
  });
}

async function getAllPlanets() {
  return await planets.find({});
}

async function savePlanet(planet) {
  try {
    await planets.updateOne(
      {
        keplerName: planet.kepler_name,
      },
      {
        keplerName: planet.kepler_name,
      },
      {
        upsert: true,
      }
    );
  } catch (err) {
    console.error(`Could not save planet ${err}`);
  }
}

module.exports = {
  loadPlanetsData,
  getAllPlanets,
};
