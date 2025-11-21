import { Sequelize } from 'sequelize';

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite',
    logging: false, 
});

try {
    await sequelize.authenticate();
    console.log(' Conexão com SQLite estabelecida com sucesso.');
} catch (error) {
    console.error(' Não foi possível conectar ao banco de dados:', error);
}

export default sequelize;