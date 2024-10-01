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

class Room {
  persons = {};
  currentOccupancy = 0;
  isFull = false;
  isLocked = false;

  constructor(name, maxCapacity, type, adjacentRooms) {
    this.name = name;
    this.maxCapacity = maxCapacity;
    this.type = type;
    this.adjacentRooms = adjacentRooms;
  }

  addDefaultPerson = (person) => {};

  processEntranceRequest = (person) => {};
}

class Agent {
  full = 50;
  rested = 50;
  health = 50;

  constructor(name, sex, age) {
    this.name = name;
    this.sex = sex;
    this.age = age;
  }

  explore = () => {};

  lookForShelter = () => {};

  rest = () => {};

  eat = () => {};

  lookForFood = () => {};
}

const timeOut = () => {
  setTimeout(() => {
    main();
    timeOut();
  }, 3000);
};

timeOut();
