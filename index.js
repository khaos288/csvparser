const csv = require('csv-parser')
const fs = require('fs')
const fuzz = require('fuzzball')
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const csvWriter = createCsvWriter({
  path: 'outputFile.csv',
  header: [
    {id: 'twofourseven', title: 'twofourseven'},
    {id: 'rivals', title: 'Rivals'},
    {id: 'certainty', title: 'Certainty'}
  ]
});

const results = [];
const twoFourData = [];
const rivalsData = [];
const output = [];
var counter = 0;

// Options defined for search library
const options = {
    // any function that takes two values and returns a score, default: ratio
    scorer: fuzz.partial_ratio, 
    // max number of top results to return, default: no limit / 0.
    limit: 1, 
    // lowest score to return, default: 0
    cutoff: 70, 
    // results won't be sorted if true, default: false. If true limit will be ignored.
    unsorted: false 
};

// Initialize the read of the CSV
fs.createReadStream('data.csv')
  .pipe(csv(['247', 'Rivals']))
  .on('data', (data) => results.push(data))
  .on('end', () => {
    // Remove first line of headers
    results.shift()
    
    // Push Rivals data to an array for use in choices below
    results.forEach(element => twoFourData.push(element['247']))
    results.forEach(element => rivalsData.push(element['Rivals']))

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
        counter += 1;
        console.log(counter)
    })

    output.sort(compare_items)
    
    csvWriter
    .writeRecords(output)
    .then(()=> console.log('The CSV file was written successfully'));

  });

  function compare_items(a,b){
      if (a.certainty < b.certainty) {
          return 1
      } else {
          return -1
      }
  }