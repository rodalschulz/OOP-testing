// THIS IS JUST A DUMB COMMENT

class Room {
  persons = [];
  totalPersons = 0;
  full = false;

  constructor(name, maxPersons) {
    this.name = name;
    this.maxPersons = maxPersons;
  }

  addPerson = (person) => {
    this.totalPersons = this.persons.length;
    if (this.totalPersons < this.maxPersons) {
      this.persons.push(person);
      console.log(`${person.name} entered the room.`);
      this.totalPersons += 1;
      person.currentRoom = this; // HERE
      if (this.totalPersons === this.maxPersons) {
        this.full = true;
        console.log(`${this.name} is now full.`);
      }
    }
  };

  personsInsideReport = () => {
    const personsInside = this.persons.length;
    console.log("-----------------------------------------");
    console.log(`Current amount of persons in ${this.name}: `, personsInside);
    const nameList = [];
    for (const person of this.persons) {
      nameList.push(person.name);
    }
    console.log(`List of persons inside the ${this.name}: `, nameList);
    console.log("-----------------------------------------");
  };

  selectPerson = () => {
    const randIdx = Math.floor(Math.random() * this.totalPersons);
    const person = this.persons[randIdx];
    console.log("Person selected: ", person.name);
    return person;
  };
}

class Person {
  currentRoom = null;
  chattingWith = null;

  constructor(name, age, sex) {
    this.name = name;
    this.age = age;
    this.sex = sex;
  }

  greet = () => {
    console.log(`It's me, ${this.name}`);
  };

  tryChat = () => {
    if (this.chattingWith === null) {
      let chosenPerson = null;
      if (this.currentRoom.persons.length > 0) {
        const randIdx = Math.floor(
          Math.random() * this.currentRoom.totalPersons
        );
        chosenPerson = this.currentRoom.persons[randIdx];
      }
      console.log("Chosen Person: ", chosenPerson?.name);
      if (
        chosenPerson?.name === this.name ||
        chosenPerson?.chattingWith !== null
      )
        return;
      const zeroOrOne = Math.round(Math.random());
      if (zeroOrOne === 1) {
        this.chattingWith = chosenPerson;
        chosenPerson.chattingWith = this;
        console.log(`${this.name} and ${chosenPerson.name} are now chatting.`);
      }
    } else {
      console.log("Person already chatting with someone");
    }
  };
}

// SESSION CHARACTERISTICS
const peopleData = [
  ["Mario", 25, true],
  ["Dylan", 28, true],
  ["Max", 22, true],
  ["Sandra", 21, false],
  ["Lori", 24, false],
  ["Mia", 23, false],
];
const invitedPeople = [];
for (let human of peopleData) {
  const person = new Person(human[0], human[1], human[2]);
  invitedPeople.push(person);
}

const livingRoom = new Room("livingRoom", 5);

// MAIN
const main = () => {
  // Arrivals
  const invitedPeopleNames = [];
  for (const person of invitedPeople) {
    invitedPeopleNames.push(person.name);
  }
  console.log(
    "People who haven't arrived or who are outside: ",
    invitedPeopleNames
  );

  const totalPersonsInvited = invitedPeople.length;
  const randInvitedPersonIdx = Math.floor(Math.random() * totalPersonsInvited);

  const personArrival = invitedPeople[randInvitedPersonIdx];
  if (livingRoom.full === false) {
    invitedPeople.splice(randInvitedPersonIdx, 1);
  }
  livingRoom.addPerson(personArrival);
  livingRoom.personsInsideReport();

  // Select protagonist and try to chat
  const protagonist = livingRoom.selectPerson();
  protagonist.tryChat();

  console.log("===================================================");
  console.log("===================================================");
  // CHOOSE A RANDOM MALE CHATTER
};

const timeOut = () => {
  setTimeout(() => {
    main();
    timeOut();
  }, 2000);
};

timeOut();
