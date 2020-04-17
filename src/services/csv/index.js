const csvParse = require('csv-parse/lib/sync');

const fromCsvSync = (csvContent, options) => {
  const content = csvParse(csvContent, options);
  return content;
};

module.exports = {
  fromCsvSync,
};
