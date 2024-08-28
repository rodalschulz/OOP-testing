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
      person.currentRoom.persons.splice(0, 1); // NEED TO DO IT WITH THE EXACT IDX
      this.persons.push(person);
      person.currentRoom = this;
      this.currentOccupancy = this.persons.length;
    }
  };
}

class Person {
  chattingWith = [];
  currentRoom = null;

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

  explore = (roomsObj) => {
    const randomAdjacent = randomChoice(this.currentRoom.adjacentRooms);
    this.reqRoomEntrance(roomsObj[randomAdjacent]);
  };
}

// SESSION PRE-EXISTENCE
const p = { Rodrigo: new Person("Rodrigo", 29, true) };
const r = {
  outside: new Room("outside", 10, ["living", "dining"]),
  living: new Room("living", 10, ["outside"]),
  dining: new Room("dining", 10, ["outside"]),
};

r.outside.addDefaultPerson(p.Rodrigo);

const main = () => {
  console.log("Outside: ", r.outside.currentOccupancy);
  console.log("Living: ", r.living.currentOccupancy);
  console.log("Dining: ", r.dining.currentOccupancy);
  p.Rodrigo.explore(r);
  console.log("-------------");
};

const timeOut = () => {
  setTimeout(() => {
    main();
    timeOut();
  }, 2000);
};

timeOut();
