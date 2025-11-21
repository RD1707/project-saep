import { DataTypes } from 'sequelize';
import sequelize from './db.js';

const Usuario = sequelize.define('Usuario', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: false,
        allowNull: false
    },
    nome: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true
    },
    nome_usuario: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true
    },
    imagem: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    senha: {
        type: DataTypes.TEXT,
        allowNull: false
    }
}, {
    tableName: 'usuarios',
    timestamps: true,
});

const Atividade = sequelize.define('Atividade', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    tipo_atividade: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    distancia_percorrida: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    duracao_atividade: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    quantidade_calorias: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    usuario_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'usuarios',
            key: 'id'
        }
    }
}, {
    tableName: 'atividades',
    timestamps: true
});

const Like = sequelize.define('Like', {
    usuario_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
            model: 'usuarios',
            key: 'id'
        }
    },
    atividade_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: {
            model: 'atividades',
            key: 'id'
        }
    }
}, {
    tableName: 'likes',
    timestamps: false
});

const Comment = sequelize.define('Comment', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
            len: [3, 5000]
        }
    },
    usuario_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    atividade_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'comments',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
});

Usuario.hasMany(Atividade, { foreignKey: 'usuario_id', as: 'atividades' });
Atividade.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });

Usuario.hasMany(Like, { foreignKey: 'usuario_id' });
Atividade.hasMany(Like, { foreignKey: 'atividade_id', as: 'likes' });
Like.belongsTo(Usuario, { foreignKey: 'usuario_id' });
Like.belongsTo(Atividade, { foreignKey: 'atividade_id' });

Usuario.hasMany(Comment, { foreignKey: 'usuario_id' });
Atividade.hasMany(Comment, { foreignKey: 'atividade_id', as: 'comments' });
Comment.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });
Comment.belongsTo(Atividade, { foreignKey: 'atividade_id' });

export { Usuario, Atividade, Like, Comment };