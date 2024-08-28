const randomChoice = (array) => {
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
};

class Room {
  persons = [];
  currentOccupancy = 0;
  full = false;
  locked = false;

  constructor(name, maxCapacity, adjacentRooms) {
    this.name = name;
    this.maxCapacity = maxCapacity;
    this.adjacentRooms = adjacentRooms;
  }

  addDefaultPerson = (person) => {
    const personIsHere = this.persons.some(
      (presentPerson) => presentPerson.name === person.name
    );

    if (!personIsHere) {
      this.persons.push(person);
      person.currentRoom = this;
      this.currentOccupancy = this.persons.length;
    }
  };

  processEntranceRequest = (person) => {
    if (!this.locked && !this.full) {
      person.currentRoom.currentOccupancy -= 1;
      const idx = person.currentRoom.persons.some((psn, idx) =>
        psn.name === person.name ? idx : null
      );
      person.currentRoom.persons.splice(idx, 1);
      this.persons.push(person);
      person.currentRoom = this;
      this.currentOccupancy = this.persons.length;
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
  chattingWith = [];
  currentRoom = null;
  chatRequestors = [];

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

  findOthers = (allRoomsObj) => {
    if (this.currentRoom.currentOccupancy <= 1) {
      this.explore(allRoomsObj);
    }
  };

  tryChat = (person) => {
    const isAlreadyChatting = this.chattingWith.some(
      (psn) => psn.name === person.name
    );
    if (!isAlreadyChatting) {
      if (person.currentRoom.name === this.currentRoom.name) {
        person.chatRequestors.push(this);
        person.processChatRequestors();
      }
    } else {
      console.log(
        `${this.name} is attempting to chat with someone who he's already chatting with.`
      );
    }
  };

  processChatRequestors = () => {
    if (this.chatRequestors.length > 0) {
      for (let i = 0; i < this.chatRequestors.length; i++) {
        const randomResponse = randomChoice([true, false]);
        if (randomResponse) {
          this.chattingWith.push(this.chatRequestors[i]);
          this.chatRequestors[i].chattingWith.push(this);
          console.log(
            `${this.name} has responded to ${this.chatRequestors[i].name} and are now chatting.`
          );
        } else {
          console.log(
            `${this.name} has ignored ${this.chatRequestors[i].name}'s chat attempt.`
          );
        }
        this.chatRequestors.splice(i, 1);
        i--;
      }
    }
  };

  beSocial = () => {
    // if (this.currentRoom.currentOccupancy > 1) {
    //   this.
    // }
  };
}

// SESSION DATA
const p = {
  Rodrigo: new Person("Rodrigo", 29, true),
  Juan: new Person("Juan", 28, true),
};
const r = {
  outside: new Room("outside", 10, ["living", "dining"]),
  living: new Room("living", 10, ["outside"]),
  dining: new Room("dining", 10, ["outside", "kitchen"]),
  kitchen: new Room("kitchen", 10, ["dining"]),
};
r.outside.addDefaultPerson(p.Rodrigo);
r.outside.addDefaultPerson(p.Juan);
// r.kitchen.locked = true;

const main = () => {
  console.log("Outside: ", r.outside.currentOccupancy);
  console.log("Living: ", r.living.currentOccupancy);
  console.log("Dining: ", r.dining.currentOccupancy);
  console.log("Kitchen: ", r.kitchen.currentOccupancy);
  p.Rodrigo.tryChat(p.Juan);
  // p.Juan.findOthers(r);

  console.log("-------------");
};

const timeOut = () => {
  setTimeout(() => {
    main();
    timeOut();
  }, 2000);
};

timeOut();
