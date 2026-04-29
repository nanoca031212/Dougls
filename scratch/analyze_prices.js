const fs = require('fs');
const data = JSON.parse(fs.readFileSync('d:/lucas/Desktop/59Am-main/src/data/products.json', 'utf8'));

const priceCounts = {};
data.products.forEach(p => {
    priceCounts[p.price] = (priceCounts[p.price] || 0) + 1;
});

console.log('Price counts:', priceCounts);
