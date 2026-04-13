const DEFAULT_PRODUCTS = [
  { name: "અમુલ શક્તિ 500 મિલી", price: 32, unit: "0.5 Litre", category: "Milk" },
  { name: "અમુલ ગોલ્ડ 6 લીટર", price: 408, unit: "6 Litre", category: "Milk" },
  { name: "અમુલ ગોલ્ડ 1 લીટર", price: 68, unit: "1 Litre", category: "Milk" },
  { name: "અમુલ ગોલ્ડ 500 મિલી", price: 35, unit: "0.5 Litre", category: "Milk" },
  { name: "અમુલ તાજા 500 મિલી", price: 28, unit: "0.5 Litre", category: "Milk" },
  { name: "અમુલ તાજા 250 મિલી", price: 14, unit: "0.25 Litre", category: "Milk" },
  { name: "જાડી છાશ 6 લીટર", price: 0, unit: "6 Litre", category: "Buttermilk" },
  { name: "છાશ 500 મિલી", price: 0, unit: "0.5 Litre", category: "Buttermilk" },
  { name: "મસાલા છાશ 200 મિલી", price: 0, unit: "0.2 Litre", category: "Buttermilk" },
  { name: "સુમુલ પ્રોબાયોટિક છાશ 480 મિલી", price: 0, unit: "0.48 Litre", category: "Buttermilk" },
  { name: "સ્કીમ મિલ્ક 6 લીટર", price: 226, unit: "6 Litre", category: "Milk" },
  { name: "ગાય નું દૂધ 500 મિલી", price: 28, unit: "0.5 Litre", category: "Milk" },
  { name: "એસ એન ટી 500 મિલી", price: 0, unit: "0.5 Litre", category: "Milk" },
  { name: "એસ એન ટી 200 મિલી", price: 0, unit: "0.2 Litre", category: "Milk" },
  { name: "અમુલ બફેલો મિલ્ક 1 લીટર", price: 73, unit: "1 Litre", category: "Milk" },
  { name: "અમુલ બફેલો મિલ્ક 6 લીટર", price: 438, unit: "6 Litre", category: "Milk" },
  { name: "લાઇટ દહીં 200 મિલી પાઉચ", price: 0, unit: "0.2 Litre", category: "Curd" },
  { name: "લાઇટ દહીં 1 લીટર પાઉચ", price: 0, unit: "1 Litre", category: "Curd" },
  { name: "પંજાબી દહીં 400 ગ્રામ પાઉચ", price: 0, unit: "0.4 kg", category: "Curd" },
  { name: "પંજાબી દહીં 1 કિ.ગ્રા. પાઉચ", price: 79, unit: "kg", category: "Curd" },
  { name: "પંજાબી દહીં 5 કિ.ગ્રા. પાઉચ", price: 0, unit: "5 kg", category: "Curd" },
  { name: "દિલખુશી લસ્સી પાઉચ (9*60) 170 મિલી", price: 0, unit: "0.17 Litre", category: "Lassi" },
  { name: "મેંગો લસ્સી પાઉચ (9*30) 170 મિલી", price: 0, unit: "0.17 Litre", category: "Lassi" },
];

const productKey = (product) =>
  `${String(product.name).trim().toLowerCase()}::${String(product.unit).trim().toLowerCase()}`;

const DEFAULT_PRODUCT_ORDER = new Map(
  DEFAULT_PRODUCTS.map((product, index) => [productKey(product), index])
);

const sortProductsForDisplay = (products) =>
  [...products].sort((a, b) => {
    const aIndex = DEFAULT_PRODUCT_ORDER.get(productKey(a));
    const bIndex = DEFAULT_PRODUCT_ORDER.get(productKey(b));

    if (aIndex !== undefined && bIndex !== undefined) return aIndex - bIndex;
    if (aIndex !== undefined) return -1;
    if (bIndex !== undefined) return 1;

    return String(a.name).localeCompare(String(b.name), undefined, {
      sensitivity: "base",
    });
  });

module.exports = {
  DEFAULT_PRODUCTS,
  productKey,
  sortProductsForDisplay,
};
