// HOUSE PARTY SIM

const { all } = require("express/lib/application");

const randomChoice = (array) => {
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
};

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
  full = false;
  locked = false;

  constructor(name, maxCapacity, type, adjacentRooms) {
    this.name = name;
    this.maxCapacity = maxCapacity;
    this.type = type;
    this.adjacentRooms = adjacentRooms;
  }

  addDefaultPerson = (person) => {
    const personIsHere = this?.persons[person.name];

    if (!personIsHere) {
      this.persons[person.name] = person;
      person.currentRoom = this;
      this.currentOccupancy = Object.keys(this.persons).length;
    }
  };

  processEntranceRequest = (person) => {
    if (!this.locked && !this.full) {
      person.currentRoom.currentOccupancy -= 1;

      delete person.currentRoom.persons[person.name];
      this.persons[person.name] = person;
      person.currentRoom = this;
      this.currentOccupancy = Object.keys(this.persons).length;
    } else if (this.locked) {
      console.log(
        `${person.name} tried to enter the ${this.name}, but it's locked.`
      );
    } else if (this.full) {
      console.log(
        `${person.name} tried to enter the ${this.name}, but it's full.`
      );
    }
  };
}

class Person {
  currentChatPool = "";
  currentRoom = null;
  chatRequestors = {};
  rejectedBy = {};
  chatCandidates = [];
  relationships = {};
  pairedUpWith = "";
  satCounter = 0;

  constructor(name, age, sex) {
    this.name = name;
    this.age = age;
    this.sex = sex;
  }

  reqRoomEntrance = (room) => {
    if (this.currentRoom.name !== room.name) {
      room.processEntranceRequest(this);
    }
  };

  explore = (allRoomsObj) => {
    const randomAdjacent = randomChoice(this.currentRoom.adjacentRooms);
    this.reqRoomEntrance(allRoomsObj[randomAdjacent]);
  };

  tryChat = (person, allChatPoolsObj) => {
    const isAlreadyChatting =
      this.currentChatPool !== "" &&
      person.currentChatPool === this.currentChatPool;

    if (!isAlreadyChatting) {
      if (person.currentRoom.name === this.currentRoom.name) {
        person.chatRequestors[this.name] = this;
        person.processChatRequestor(allChatPoolsObj);
      }
    } else {
      console.log(
        `${this.name} is attempting to chat with someone who he's already chatting with.`
      );
    }
  };

  processChatRequestor = (allChatPoolsObj) => {
    if (Object.keys(this.chatRequestors).length > 0) {
      for (let i = 0; i < Object.keys(this.chatRequestors).length; i++) {
        const requestorObj = Object.values(this.chatRequestors)[i];
        const requestorName = Object.keys(this.chatRequestors)[i];
        const randomResponse = randomChoice([true, false]);
        if (randomResponse) {
          if (this.currentChatPool === "") {
            // Create a new ChatPool
            const newChatPoolName = this.name + "-" + requestorName;
            allChatPoolsObj[newChatPoolName] = new ChatPool(newChatPoolName);
            allChatPoolsObj[newChatPoolName].members[this.name] = this;
            allChatPoolsObj[newChatPoolName].members[requestorName] =
              requestorObj;
            this.currentChatPool = newChatPoolName;
            requestorObj.currentChatPool = newChatPoolName;
            console.log(
              `${this.name} has accepted ${requestorObj.name}'s chat attempt and both are now chatting in the ${this.currentRoom.name}.`
            );
          } else {
            // Add to an already existing ChatPool
            allChatPoolsObj[this.currentChatPool].members[requestorName] =
              requestorObj;
            requestorObj.currentChatPool = this.currentChatPool;
            console.log(
              `${this.name} has accepted ${requestorObj.name}'s chat attempt and ${requestorObj.name} has been added to the Chat Pool.`
            );
          }
        } else {
          requestorObj.rejectedBy[this.name] = ""; // do i even need to add the whole object "this", could be an empty string
          console.log(
            `${this.name} has rejected ${requestorObj.name}'s chat attempt.`
          );
        }

        delete this.chatRequestors[requestorName];
        i--;
      }
    }
  };

  attemptMove = (personsNamesInChatPool, allChatPoolsObj) => {
    if (this.sex === false || this.pairedUpWith !== "") return; // if fem or already paired up
    const femNamesInChatPool = personsNamesInChatPool.filter(
      (psnName) => this.currentRoom.persons[psnName].sex === false
    );
    if (femNamesInChatPool.length >= 1) {
      const randomFemName = randomChoice(femNamesInChatPool);
      const randomFem = this.currentRoom.persons[randomFemName];
      if (randomFem.relationships[this.name] > 10) {
        const attemptSuccess = randomChoice([true, false]);
        console.log(`${this.name} has attempted success: ${attemptSuccess}`);
        if (attemptSuccess) {
          this.pairedUpWith = randomFemName;
          randomFem.pairedUpWith = this.name;
          // Abandon ChatPool
          delete allChatPoolsObj[this.currentChatPool].members[this.name];
          delete allChatPoolsObj[this.currentChatPool].members[randomFem.name];
          this.currentChatPool = "";
          randomFem.currentChatPool = "";
          console.log(`${this.name} and ${randomFemName} are now paired up.`);
        }
      }
    }
  };

  evolveRelationship = (allChatPoolsObj) => {
    if (this.currentChatPool !== "") {
      const personsInChatPool = Object.keys(
        allChatPoolsObj[this.currentChatPool].members
      ).filter((psn) => psn !== this.name);
      const randomPersonName = randomChoice(personsInChatPool);
      if (this.relationships[randomPersonName]) {
        const result = randomChoiceProb(
          [-2, -1, 1, 2, 3],
          [0.15, 0.2, 0.3, 0.2, 0.15]
        );
        this.relationships[randomPersonName] += result;
        if (this.relationships[randomPersonName] < 0) {
          this.relationships[randomPersonName] = 0;
        }
      } else {
        this.relationships[randomPersonName] = 1;
      }
      this.attemptMove(personsInChatPool, allChatPoolsObj);
    }
  };

  evolveSat = (allPersonsObj) => {
    if (this.currentRoom.locked && this.pairedUpWith) {
      this.satCounter++;
    }
    if (this.satCounter > 12) {
      this.satCounter = 0;
      console.log(
        `${this.name} and ${this.pairedUpWith} have come out of the locked room.`
      );
      allPersonsObj[this.pairedUpWith].pairedUpWith = "";
      this.pairedUpWith = "";
      this.currentRoom.locked = false;
    }
  };

  findBedRoom = (allRoomsObj, allPersonsObj) => {
    if (this.pairedUpWith !== "" && this.currentRoom.locked === false) {
      this.explore(allRoomsObj);
      if (
        this.currentRoom.currentOccupancy <= 1 &&
        this.currentRoom.type === "bedroom"
      ) {
        this.currentRoom.locked = true;
        const personPair = allPersonsObj[this.pairedUpWith];

        personPair.currentRoom.currentOccupancy -= 1;
        delete personPair.currentRoom.persons[personPair.name];

        this.currentRoom.addDefaultPerson(personPair);
        console.log(
          `${this.name} has locked ${this.currentRoom.name} with ${personPair.name}.`
        );
      }
    }
  };

  beSocial = (allRoomsObj, allChatPoolsObj, allPersonsObj) => {
    const personsInRoom = this.currentRoom.persons;
    // reset rejections
    if (globalCounter % 20 === 0) {
      this.rejectedBy = {};
    }

    if (this.pairedUpWith === "" && this.currentRoom.currentOccupancy <= 1) {
      this.explore(allRoomsObj);
    } else if (this.pairedUpWith === "" && this.currentChatPool === "") {
      // Filter out persons who have rejected and who are not self
      this.chatCandidates = Object.keys(personsInRoom).filter(
        (name) =>
          !Object.keys(this.rejectedBy).includes(name) && name !== this.name
      );
      // Filter out persons with full ChatPools
      this.chatCandidates = this.chatCandidates.filter(
        (name) =>
          personsInRoom[name].currentChatPool === "" ||
          Object.keys(
            allChatPoolsObj[personsInRoom[name].currentChatPool].members
          ).length <
            allChatPoolsObj[personsInRoom[name].currentChatPool].personLimit
      );

      if (this.chatCandidates.length !== 0) {
        const randomCandidate = randomChoice(this.chatCandidates);
        this.tryChat(personsInRoom[randomCandidate], allChatPoolsObj);
      } else {
        this.explore(allRoomsObj);
      }
    } else if (this.currentChatPool !== "") {
      this.evolveRelationship(allChatPoolsObj);
      this.evolveSat(allPersonsObj);
    } else {
      this.findBedRoom(allRoomsObj, allPersonsObj);
    }
  };
}

class ChatPool {
  name;
  members = {};
  personLimit = 3;

  constructor(name) {
    this.name = name;
  }
}

// SESSION DATA ---------------
//    Assets
const p = {
  Carl: new Person("Carl", 29, true),
  Juan: new Person("Juan", 28, true),
  Manuel: new Person("Manuel", 29, true),
  Kyara: new Person("Kyara", 25, false),
  Sammy: new Person("Sammy", 22, false),
};
const r = {
  bedroom1: new Room("bedroom1", 4, "bedroom", ["hallway"]),
  bedroom2: new Room("bedroom2", 4, "bedroom", ["hallway"]),
  hallway: new Room("hallway", 10, "std", ["living", "bedroom1", "bedroom2"]),
  living: new Room("living", 10, "std", ["hallway", "dining"]),
  dining: new Room("dining", 10, "std", ["living", "kitchen", "terrace"]),
  kitchen: new Room("kitchen", 10, "std", ["dining", "terrace"]),
  terrace: new Room("terrace", 10, "std", ["kitchen", "dining"]),
};
const cp = {};
//    Initial States
r.kitchen.addDefaultPerson(p.Carl);
r.terrace.addDefaultPerson(p.Juan);
r.dining.addDefaultPerson(p.Manuel);
r.living.addDefaultPerson(p.Kyara);
r.hallway.addDefaultPerson(p.Sammy);
// r.laundry.locked = true;

let globalCounter = 0;
const main = () => {
  counter++;
  console.log("GLOBAL COUNTER: ", counter);

  console.log(
    `Terrace: ${r.terrace.currentOccupancy} | Kitchen: ${r.kitchen.currentOccupancy} | Dining: ${r.dining.currentOccupancy} | Living: ${r.living.currentOccupancy} | Hallway: ${r.hallway.currentOccupancy} | Bedroom1: ${r.bedroom1.currentOccupancy} | Bedroom2: ${r.bedroom2.currentOccupancy}`
  );
  console.log("---");
  console.log(
    `Bedroom1 locked: ${r.bedroom1.locked} | Bedroom2 locked: ${r.bedroom2.locked}`
  );
  console.log("Kyara's Relationships: ", p.Kyara.relationships);
  console.log("Sammy's Relationships: ", p.Sammy.relationships);
  p.Carl.beSocial(r, cp, p);
  p.Juan.beSocial(r, cp, p);
  p.Manuel.beSocial(r, cp, p);
  p.Kyara.beSocial(r, cp, p);
  p.Sammy.beSocial(r, cp, p);

  console.log("-------------");
};

const timeOut = () => {
  setTimeout(() => {
    main();
    timeOut();
  }, 3000);
};

timeOut();
