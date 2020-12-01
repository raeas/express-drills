const { response } = require('express');
const express = require('express');
const morgan = require('morgan')

const app = express();

app.use(morgan('dev'));

app.get('/pizza/pepperoni', (req, res) => {
  res.send('Your pizza is on the way!!!')
});

app.get('/pizza/pineapple', (req, res) => {
  res.send('We do no serve tat pizza here. Never call again!!!')
});

app.get('/echo', (req, res) => {
  const responseText = `Here are some details of your request:
    Base URL: ${req.baseUrl}
    Host: ${req.hostname}
    Path: ${req.path}
  `;
  res.send(responseText);
});

app.get('/queryViewer', (req, res) => {
  console.log(req.query);
  res.end(); //do not send any data back to the client
});

app.get('/greetings', (req, res) => {
  //1. get values from the request
  const name = req.query.name;
  const race = req.query.race;

  //2. validate the values
  if(!name) {
    //3. name was not provided
    return res.status(400).send('Please provide a name');
  }

  if(!race) {
    //3. race was not provided
    return res.status(400).send('Please provide a race');
  }

  //4. and 5. both name and race are valid so do the processing.
  const greeting = `Greetings ${name} the ${race}, welcome to our kingdom.`;

  //6. send the response 
  res.send(greeting);
});

//Drill 1
//Create a route handler function on the path /sum that accepts two query 
//parameters named a and b and find the sum of the two values. Return a string 
//in the format "The sum of a and b is c". Note that query parameters are always 
//strings so some thought should be given to converting them to numbers.
app.get('/sum', (req, res) => {
  const {a, b} = req.query;

  // Validation - a and b are required and should be numbers
  if(!a) {
    return res  
      .status(400)
      .send('a is required');
  }

  if (!b) {
    return res
      .status(400)
      .send('b is required')
  }

  const numA = parseFloat(a);
  const numB = parseFloat(b);

  if(Number.isNaN(numA)){
    return res  
      .status(400)
      .send('a must be a number')
  }

  if(Number.isNaN(numB)){
    return res  
      .status(400)
      .send('b must be a number')
  }

  // validation passed so perform the task
  const c = numA + numB;

  // format the response string
  const responseString = `The sum of ${numA} and ${numB} is ${c}`;

  // send the response
  res
    .status(200)
    .send(responseString)

});

//Drill 2
//Create an endpoint /cipher. The handler function should accept 
//a query parameter named text and one named shift. Encrypt the text
//using a simple shift cipher also known as a Caesar Cipher. It is a 
//simple substitution cipher where each letter is shifted a certain number 
//of places down the alphabet. So if the shift was 1 then A would be replaced 
//by B, and B would be replaced by C and C would be replaced by D and so on 
//until finally Z would be replaced by A. using this scheme encrypt the text 
//with the given shift and return the result to the client. 
//Hint - String.fromCharCode(65) is an uppercase A and 'A'.charCodeAt(0) is the number 65. 
//65 is the integer value of uppercase A in UTF-16. See the documentation for details.


app.get('/cipher', (req, res) => {
  const { text, shift } = req.query;

  // validation: both values are required, shift must be a number
  if(!text) {
    return res  
      .status(400)
      .send('text is required')
  }

  if(!shift) {
    return res
      .status(400)
      .send('shift is required')
  }

  const numShift = parseFloat(shift);

  if(Number.isNaN(numShift)) {
    return res  
    .status(400)
    .send('shift must be a number');
  }

  // all valid, perform the task
  // Make the text uppercase for convenience
  // the question did not say what to do with punctuation marks
  // and numbers so we will ignore them and only convert letters.
  // Also just the 26 letters of the alphabet in typical use in the US
  // and UK today. To support an international audience we will have to
  // do more
  // Create a loop over the characters, for each letter, covert
  // using the shift

  const base = 'A'.charCodeAt(0);

  const cipher = text
    .toUpperCase()
    .split('') //create an array of characters
    .map(char => { //map each original char to a converted char
      const code = char.charCodeAt(0); //get the char code

    //if it is not one of the 26 letters, ignore it
      if(code < base || code > (base + 26)) {
        return char;
      }

      //otherwise convert it
      //get the distance from A
      let diff = code - base;
      diff = diff + numShift;

      //in case shift takes the value past Z, cycle back to the beginnning
      diff = diff % 26

      //convert back to a character
      const shiftedChar = String.fromCharCode(base + diff);
      return shiftedChar;
    })

    .join(''); //construct a String from the array

    res
      .status(200)
      .send(cipher)

})

//Drill 3
//To send an array of values to the server via a query string 
//simply repeat the key with different values. For instance, the 
//query string ?arr=1&arr=2&arr=3 results in the query 
//object { arr: [ '1', '2', '3' ] }. Create a new endpoint /lotto that 
//accepts an array of 6 distinct numbers between 1 and 20 named numbers. 
//The function then randomly generates 6 numbers between 1 and 20. Compare 
//the numbers sent in the query with the randomly generated numbers to 
//determine how many match. If fewer than 4 numbers match respond with the
//string "Sorry, you lose". If 4 numbers match respond with the string 
//"Congratulations, you win a free ticket", if 5 numbers match respond with 
//"Congratulations! You win $100!". If all 6 numbers match respond with 
//"Wow! Unbelievable! You could have won the mega millions!".

app.get('/lotto', (req, res) => {
  const { numbers } = req.query;

  // validation: 
  // 1. the numbers array must exist
  // 2. must be an array
  // 3. must be 6 numbers
  // 4. numbers must be between 1 and 20

  if(!numbers) {
    return res
      .status(400)
      .send('numbers is required');
  }

  if(!Array.isArray(numbers)) {
    return res
      .status(400)
      .send('numbers must be an array');
  }

  const guesses = numbers
    .map(n => parseInt(n))
    .filter(n => !Number.isNaN(n) && (n >= 1 && n <= 20));

  if(guesses.length != 6) {
    return res
      .status(400)
      .send('numbers must contain 6 integers between 1 and 20')
  }

  //fully validated numbers

  //here are the 20 numbers to choose from
  const stockNumbers = Array(20).fill(1).map((_, i) => i + 1);

  //randomly choose 6
  const winningNumbers = [];
  for(let i = 0; i < 6; i++){
    const ran = Math.floor(Math.random() * stockNumbers.length);
    winningNumbers.push(stockNumbers[ran]);
    stockNumbers.splice(ran, 1);
  }

  //compare the guesses to the winning number
  let diff = winningNumbers.filter(n => !guesses.includes(n));

  //construct a response
  let responseText;

  switch(diff.length){
    case 0:
      responseText = 'Wow! Unbelievable! You could have won the mega millions!';
      break;
    case 1:
      responseText = 'Congratulations! You win $100!';
      break;
    case 2:
      responseText = 'Congratulations! You win a free ticket!';
      break;
    default:
      responseText = 'Sorry, you lose'
  }

  //ucomment below to see how the results ran

  res.json({
    guesses,
    winningNumbers,
    diff,
    responseString
  })

  res.send(responseText);

});



// Drill 3
app.get('/lotta', (req, res) => {
  const { numbers } = req.query; 

  // validation: 
  // 1. the numbers array must exist
  // 2. must be an array
  // 3. must be 6 numbers
  // 4. numbers must be between 1 and 20

  if(!numbers) {
    return res
      .status(400)
      .send("numbers is required");
  }

  if(!Array.isArray(numbers)) {
    return res
      .status(400)
      .send("numbers must be an array");
  }

  const guesses = numbers
        .map(n => parseInt(n))
        .filter(n => !Number.isNaN(n) && (n >= 1 && n <= 20));
  
  if(guesses.length != 6) {
    return res
      .status(400)
      .send("numbers must contain 6 integers between 1 and 20");
  }      

  // fully validated numbers

  // here are the 20 numbers to choose from
  const stockNumbers = Array(20).fill(1).map((_, i) => i + 1);

  //randomly choose 6
  const winningNumbers = [];
  for(let i = 0; i < 6; i++) {
    const ran = Math.floor(Math.random() * stockNumbers.length);
    winningNumbers.push(stockNumbers[ran]);
    stockNumbers.splice(ran, 1);
  }

  //compare the guesses to the winning number
  let diff = winningNumbers.filter(n => !guesses.includes(n));

  // construct a response
  let responseText;

  switch(diff.length){
    case 0: 
      responseText = 'Wow! Unbelievable! You could have won the mega millions!';
      break;
    case 1:   
      responseText = 'Congratulations! You win $100!';
      break;
    case 2:
      responseText = 'Congratulations, you win a free ticket!';
      break;
    default:
      responseText = 'Sorry, you lose';  
  }


  // uncomment below to see how the results ran

  res.json({
    guesses,
    winningNumbers,
    diff,
    responseText
  });

  res.send(responseText);
});



app.listen(8000, () => {
  console.log('Express server is listening on port 8000!')
});