const express = require('express');
const oracledb = require('oracledb');
const cors = require('cors');

const app = express();
const port = 3000;

// Configuración de CORS
app.use(cors());

// Configuración de la base de datos Oracle
const dbConfig = {
  user: 'EDUARDO',
  password: '1234',
  connectString: '192.168.0.50:1521/orcl_DGMGRL'  // Formato: host:port/sid
};

// Middleware para parsear el body de las solicitudes
app.use(express.json());

// Ruta para ejecutar el stored procedure genérico
app.post('/executeSP', async (req, res) => {
    let connection;
  
    try {
      const { spName, spParams } = req.body;
      connection = await oracledb.getConnection(dbConfig);
      
      // Construir la llamada al stored procedure
      let bindVars = {};
      spParams.forEach((param, index) => {
        bindVars[`param${index + 1}`] = param;
      });
  
      // Añadir parámetro de salida para el cursor
      bindVars.RESPONSE = { dir: oracledb.BIND_OUT, type: oracledb.CURSOR };
  
      const result = await connection.execute(
        `BEGIN
           ${spName}(${Object.keys(bindVars).map(k => `:${k}`).join(', ')});
         END;`,
        bindVars
      );
  
      // Procesar el cursor
      const resultSet = result.outBinds.RESPONSE;
        const metaData = resultSet.metaData;
        const rows = await resultSet.getRows();
        await resultSet.close();
        console.log('metaData', metaData)
  
      // Formatear los resultados como un arreglo de objetos
      const formattedRows = rows.map(row => {
        let obj = {};
        row.forEach((value, index) => {
          obj[metaData[index].name.toLowerCase()] = value;
        });
        return obj;
      });
      console.log('formattedRows', formattedRows)
      
      res.json(formattedRows);
    } catch (err) {
      console.error(err);
      res.status(500).send('Error executing stored procedure');
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (err) {
          console.error(err);
        }
      }
    }
  });
// Iniciar el servidor
app.listen(port, () => {
  console.log(`API listening at http://localhost:${port}`);
});