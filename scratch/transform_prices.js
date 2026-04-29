
const fs = require('fs');
const path = require('path');

const productsPath = 'd:/lucas/Desktop/59Am-main/src/data/products.json';
const productsData = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

const categories = [
  { sale: 26.99, minOrig: 119, maxOrig: 127 },
  { sale: 28.99, minOrig: 129, maxOrig: 135 },
  { sale: 29.99, minOrig: 139, maxOrig: 145 },
  { sale: 30.99, minOrig: 133, maxOrig: 156 },
  { sale: 31.99, minOrig: 135, maxOrig: 148 }
];

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

productsData.products.forEach(product => {
  const cat = categories[Math.floor(Math.random() * categories.length)];
  const originalPrice = getRandomInt(cat.minOrig, cat.maxOrig);
  
  // No sistema atual, product.price parece ser o preço base (original)
  // e promotion.discount_percentage reduz esse preço.
  product.price = originalPrice;
  
  // Calcular o desconto necessário para chegar no preço de venda
  // salePrice = originalPrice * (1 - discount / 100)
  // salePrice / originalPrice = 1 - discount / 100
  // discount / 100 = 1 - (salePrice / originalPrice)
  // discount = (1 - (salePrice / originalPrice)) * 100
  const discount = (1 - (cat.sale / originalPrice)) * 100;
  
  product.promotion = {
    type: "fixed",
    description: "ANGEBOT",
    discount_percentage: Math.round(discount * 100) / 100, // Arredondar para 2 casas
    valid_until: "2026-12-31"
  };
  
  // Atualizar variantes
  if (product.variants && product.variants.length > 0) {
    product.variants.forEach(variant => {
      variant.price = originalPrice;
    });
  }
});

fs.writeFileSync(productsPath, JSON.stringify(productsData, null, 2), 'utf8');
console.log('Produtos atualizados com sucesso!');
