const randomChoice = (array) => {
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
};

const x = randomChoice(["A", "B", "C"]);
console.log(x);
