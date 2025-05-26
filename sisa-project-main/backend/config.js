const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306, // Adiciona suporte à porta
    dialect: "mysql",
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    define: {
      timestamps: true
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    dialectOptions: {
      // Configurações para conexão segura se necessário
      connectTimeout: 60000,
      acquireTimeout: 60000,
      timeout: 60000,
    }
  }
);

// Função para testar e sincronizar o banco
const initializeDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexão com o banco de dados estabelecida com sucesso.');
    
    if (process.env.NODE_ENV !== 'production') {
      await sequelize.sync({ alter: true });
      console.log('✅ Modelos sincronizados com o banco de dados.');
    } else {
      // Em produção, apenas verifica se as tabelas existem
      await sequelize.sync();
      console.log('✅ Verificação do banco de dados concluída.');
    }
  } catch (error) {
    console.error('❌ Erro ao conectar/sincronizar o banco de dados:', error);
    console.error('Detalhes da conexão:', {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      user: process.env.DB_USER
    });
  }
};

// Inicializar o banco quando o módulo for carregado
initializeDatabase();

module.exports = sequelize;