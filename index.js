const csv = require('csv-parser')
const fs = require('fs')
const fuzz = require('fuzzball')
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

// Setting up csv writer instance
const csvWriter = createCsvWriter({
  path: 'outputFile.csv',
  header: [
    {id: 'twofourseven', title: 'twofourseven'},
    {id: 'rivals', title: 'Rivals'},
    {id: 'certainty', title: 'Certainty'}
  ]
});

// Set up variables
const results = [];
const twoFourData = [];
const rivalsData = [];
const output = [];
var counter = 0;

// Options defined for search library
const options = {
    // any function that takes two values and returns a score, default: ratio
    scorer: fuzz.partial_ratio, 
    // max number of top results to return, default: no limit / 0
    limit: 1, 
    // lowest score to return, default: 0
    cutoff: 70, 
    // results won't be sorted if true, default: false. If true limit will be ignored
    unsorted: false 
};

// Initialize the read of the CSV
fs.createReadStream('data.csv')
  .pipe(csv(['247', 'Rivals']))
  .on('data', (data) => results.push(data))
  .on('end', () => {
    // Remove first line of headers
    results.shift()
    
    // Push Rivals data to array sfor use in choices below
    results.forEach(element => twoFourData.push(element['247']))
    results.forEach(element => rivalsData.push(element['Rivals']))

    // Adjust the number to the number of rivals data that is actually useful (index count starts at 0, so subtract one from real number)
    var filtered = rivalsData.slice(0, 3454)

    // Start For loop to go through each element
    filtered.forEach(element => {
        // Build an array that parses the 247 element out of each row, compares to every rivals row, using the earlier defined options
        arr = fuzz.extract(element, twoFourData, options)

        // pushing record to output array for csv creation
        if (arr.length > 0) {
            output.push({
                twofourseven: arr[0][0],
                rivals: element,
                certainty: arr[0][1]
            })
        }

        // Built a counter so I can tell if this is working or not
        counter += 1;
        console.log(counter)
    })

    // Sort by certainty factor
    output.sort(compare_items)
    
    // Write to output file
    csvWriter
    .writeRecords(output)
    .then(()=> console.log('The CSV file was written successfully'));

  });

  // Function that sorts based on certainty
  function compare_items(a,b){
      if (a.certainty < b.certainty) {
          return 1
      } else {
          return -1
      }
  }