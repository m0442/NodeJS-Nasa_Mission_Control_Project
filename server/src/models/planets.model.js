const fs = require("fs");
const path = require("path");
const { parse } = require("csv-parse");

const habitablePlanets = [];

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
      .on("data", (data) => {
        // Add the planet if it meets the habitable criteria
        if (isHabitablePlanet(data)) {
          habitablePlanets.push(data);
        }
      })
      .on("error", (err) => {
        // Handle any errors that occur during the read process
        console.log("Error occurred:", err);
        reject(err);
      })
      .on("end", () => {
        // Print the final count of habitable planets
        console.log(`${habitablePlanets.length} Habitable Planets were found`);

        resolve();
      });
  });
}

function getAllPlanets() {
  return habitablePlanets;
}

module.exports = {
  loadPlanetsData,
  getAllPlanets,
};
