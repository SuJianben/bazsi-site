export const products = [
  { id: 'felnott-pulover', name: 'Felnőtt kapucnis pulóver', type: 'PULÓVER', group: 'felnott', image: 'assets/hoodie.png', sizes: ['XS','S','M','L','XL'], description: 'A mindennapokra tervezett, klasszikus kapucnis pulóver.' },
  { id: 'gyerek-pulover', name: 'Gyerek kapucnis pulóver', type: 'PULÓVER', group: 'gyerek', image: 'assets/hoodie.png', sizes: ['L','XL'], description: 'Klasszikus kapucnis pulóver a következő generációnak.' },
  { id: 'felnott-polo', name: 'Felnőtt póló', type: 'PÓLÓ', group: 'felnott', image: 'assets/tshirt.png', sizes: ['XS','S','M','L','XL'], description: 'Egyszerű, sokoldalú póló minden napra.' },
  { id: 'gyerek-polo', name: 'Gyerek póló', type: 'PÓLÓ', group: 'gyerek', image: 'assets/tshirt.png', sizes: ['L','XL'], description: 'Egy mindennapi alapdarab, gyerek méretekben.' },
];
export const productById = id => products.find(product => product.id === id);
