const oracledb = require('oracledb');

async function run() {  
  try {
    const connection = await oracledb.getConnection({
      user: "inventario",
      password: "Mariano",
      connectString: "192.168.56.101:1521/cdb1.world"
    });

    const result = await connection.execute(`SELECT * FROM DUAL`);
    console.log("Result is:", result.rows);
    
    await connection.close();
  } catch (err) {
    console.error(err);
  }
}

run();
