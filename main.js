const randomChoiceProb = (array, probabilities) => {
  if (array.length !== probabilities.length) {
    throw new Error("Array and probabilities must have the same length.");
  }
  const sum = probabilities.reduce((acc, prob) => acc + prob, 0);
  const tolerance = 1e-10;
  if (Math.abs(sum - 1) > tolerance) {
    throw new Error("Probabilities must sum up to 1.");
  }

  const random = Math.random();
  let cumulativeProbability = 0;
  for (let i = 0; i < array.length; i++) {
    cumulativeProbability += probabilities[i];
    if (random < cumulativeProbability) {
      return array[i];
    }
  }
};

const randomChoice = (array) => {
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
};

class Room {
  agentIds = {};
  squares = {};
  currentOccupancy = 0;
  isFull = false;
  isLocked = false;

  constructor(
    id,
    name,
    maxCapacity,
    type,
    spaceArray,
    rootSpawn,
    adjacentRooms
  ) {
    this.id = id;
    this.name = name;
    this.maxCapacity = maxCapacity;
    this.type = type;
    this.adjacentRooms = adjacentRooms;
    this.spaceArray = spaceArray;
    this.rootSpawn = rootSpawn;
  }

  addDefaultAgent = (agentId, allAgents) => {
    if (this.agentIds[agentId]) {
      console.log("Agent is already inside the room");
      return;
    } else if (
      this.squares[this.rootSpawn] &&
      this.squares[this.rootSpawn] !== ""
    ) {
      console.log("Someone is currently blocking the spawn point");
      return;
    } else {
      this.agentIds[agentId] = true;
      this.squares[this.rootSpawn] = agentId;
      allAgents[agentId].currentRoomId = this.id;
      allAgents[agentId].coordinates = this.rootSpawn;
    }
  };

  processEntranceRequest = (agent) => {};
}

class Agent {
  full = 50;
  rested = 50;
  health = 50;
  currentRoomId = "";
  coordinates = "";

  constructor(id, name, sex, age) {
    this.id = id;
    this.name = name;
    this.sex = sex;
    this.age = age;
  }

  exist = (timeUnit) => {
    this.full -= timeUnit;
    this.rested -= timeUnit;
    this.health -= timeUnit;
  };

  exploreRoom = (allRooms) => {
    if (this.currentRoomId === "") {
      console.log("Person is not in a room and therefore can't explore");
      return;
    }
    const space = allRooms[this.currentRoomId].spaceArray;
    const coordinatesParsed = JSON.parse(this.coordinates);
    const spaceLength = space[0].length;
    const spaceHeight = space.length;

    const upCoord =
      coordinatesParsed[0] - 1 >= 0
        ? [coordinatesParsed[0] - 1, coordinatesParsed[1]]
        : false;
    const downCoord =
      coordinatesParsed[0] + 1 <= spaceHeight - 1
        ? [coordinatesParsed[0] + 1, coordinatesParsed[1]]
        : false;
    const leftCoord =
      coordinatesParsed[1] - 1 >= 0
        ? [coordinatesParsed[0], coordinatesParsed[1] - 1]
        : false;
    const rightCoord =
      coordinatesParsed[1] + 1 <= spaceLength - 1
        ? [coordinatesParsed[0], coordinatesParsed[1] + 1]
        : false;

    const adjacentSquares = [upCoord, downCoord, leftCoord, rightCoord];
    const validAdjSquares = adjacentSquares.filter((coord) => coord);
    const chosenCoords = randomChoice(validAdjSquares);
    const chosenCoordsStr = JSON.stringify(chosenCoords);
    allRooms[this.currentRoomId].squares[this.coordinates] = "";
    this.coordinates = chosenCoordsStr;
    allRooms[this.currentRoomId].squares[chosenCoordsStr] = this.id;
  };

  lookForShelter = () => {};

  rest = () => {};

  eat = () => {};

  lookForFood = () => {};
}

// Initializers
const allRooms = {
  0: new Room(
    "0",
    "base",
    10,
    "std",
    [
      [0, 0, 0],
      ["D", 0, "R"],
    ],
    "[1,2]",
    []
  ),
};
const allAgents = { 1: new Agent("1", "Rod", 1, 30) };

allRooms[0].addDefaultAgent(allAgents[1].id, allAgents);

let globalTime = 0;
const main = () => {
  const timeUnit = 1;
  globalTime = globalTime + timeUnit;
  console.log(globalTime);

  console.log("Rod's hunger: ", allAgents[1].full);
  console.log("Current Rod's coordinates: ", allAgents[1].coordinates);
  console.log("Base's Square Obj: ", allRooms[0].squares);
  allAgents[1].exist(timeUnit);
  allAgents[1].exploreRoom(allRooms);
};

const roller = () => {
  setTimeout(() => {
    main();
    roller();
  }, 1000);
};

roller();
