const randomChoice = (array) => {
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
};

class Room {
  persons = {};
  currentOccupancy = 0;
  full = false;
  locked = false;

  constructor(name, maxCapacity, adjacentRooms) {
    this.name = name;
    this.maxCapacity = maxCapacity;
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
  chattingWith = {};
  currentRoom = null;
  chatRequestors = {};
  rejectedBy = {};
  chatCandidates = [];

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

  // findOthers = (allRoomsObj) => {
  //   if (this.currentRoom.currentOccupancy <= 1) {
  //     this.explore(allRoomsObj);
  //   }
  // };

  tryChat = (person) => {
    const isAlreadyChatting = this?.chattingWith[person.name];

    if (!isAlreadyChatting) {
      if (person.currentRoom.name === this.currentRoom.name) {
        person.chatRequestors[this.name] = this;
        person.processChatRequestor();
      }
    } else {
      console.log(
        `${this.name} is attempting to chat with someone who he's already chatting with.`
      );
    }
  };

  processChatRequestor = () => {
    if (Object.keys(this.chatRequestors).length > 0) {
      for (let i = 0; i < Object.keys(this.chatRequestors).length; i++) {
        const randomResponse = randomChoice([true, false]);
        if (randomResponse) {
          this.chattingWith[Object.keys(this.chatRequestors)[i]] =
            Object.values(this.chatRequestors)[i];
          Object.values(this.chatRequestors)[i].chattingWith[this.name] = this;
          console.log(
            `${this.name} has responded to ${
              Object.values(this.chatRequestors)[i].name
            }'s chat attempt and both are now chatting.`
          );
        } else {
          Object.values(this.chatRequestors)[i].rejectedBy[this.name] = ""; // do i even need to add the whole object "this", could be an empty string
          console.log(
            `${this.name} has rejected ${
              Object.values(this.chatRequestors)[i].name
            }'s chat attempt.`
          );
        }
        delete this.chatRequestors[Object.keys(this.chatRequestors)[i]];
        i--;
      }
    }
  };

  beSocial = (allRoomsObj) => {
    if (this.currentRoom.currentOccupancy <= 1) {
      this.explore(allRoomsObj);
    } else if (Object.keys(this.chattingWith).length === 0) {
      this.chatCandidates = Object.keys(this.currentRoom.persons).filter(
        (name) =>
          !Object.keys(this.rejectedBy).includes(name) && name !== this.name
      );
      if (this.chatCandidates.length !== 0) {
        const randomCandidate = randomChoice(this.chatCandidates);
        this.tryChat(this.currentRoom.persons[randomCandidate]);
      } else {
        this.explore(allRoomsObj);
      }
    }
  };
}

// SESSION DATA ---------------
//    Assets
const p = {
  Rodrigo: new Person("Rodrigo", 29, true),
  Juan: new Person("Juan", 28, true),
  Manuel: new Person("Manuel", 29, true),
};
const r = {
  outside: new Room("outside", 10, ["living", "dining"]),
  living: new Room("living", 10, ["outside"]),
  dining: new Room("dining", 10, ["outside", "kitchen"]),
  kitchen: new Room("kitchen", 10, ["dining"]),
};
//    States
r.outside.addDefaultPerson(p.Rodrigo);
r.kitchen.addDefaultPerson(p.Juan);
r.dining.addDefaultPerson(p.Manuel);
// r.kitchen.locked = true;

const main = () => {
  console.log("Outside: ", r.outside.currentOccupancy);
  console.log("Living: ", r.living.currentOccupancy);
  console.log("Dining: ", r.dining.currentOccupancy);
  console.log("Kitchen: ", r.kitchen.currentOccupancy);
  p.Rodrigo.beSocial(r);
  p.Juan.beSocial(r);

  console.log("-------------");
};

const timeOut = () => {
  setTimeout(() => {
    main();
    timeOut();
  }, 2000);
};

timeOut();
