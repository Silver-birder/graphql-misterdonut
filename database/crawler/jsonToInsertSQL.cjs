const fs = require("fs");
const taskFolder = "./storage/datasets/default/";

let sqls = "";
const jsonToSql = (row) => {
  const data = JSON.parse(row);
  const matchedPrice = data.price.match(/(\d+)円/);
  let price = 0;
  if (matchedPrice !== null) {
    price = matchedPrice[1];
  }
  const matchedMonth = data.price.match(/(\d+)月/);
  let month = "1";
  if (matchedMonth !== null) {
    month = matchedMonth[1];
  }
  const created_at = `${data.createdYear}-${month.padStart(2, "0")}-01`;

  return `INSERT INTO misterdonut (name, category, price, description, img, created_at, row) VALUES ('${data.name}', '${data.category}', ${price}, '${data.describe}', '${data.img}', DATE '${created_at}', '${row}');`;
};

const getTasks = async (file) => {
  const fsPromise = require("fs").promises;
  const data = await fs.readFileSync(`${taskFolder}${file}`);
  return jsonToSql(data);
};

fs.readdir(taskFolder, async (err, files) => {
  files.forEach(getTasks);
  const sqls = await Promise.all(files.map(getTasks));
  fs.writeFileSync("./data.sql", sqls.join("\n"));
});
