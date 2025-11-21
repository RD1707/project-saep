CREATE DATABASE IF NOT EXISTS saep_saude;
USE saep_saude;

CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY,
    nome TEXT,
    email VARCHAR(255) NOT NULL UNIQUE,
    nome_usuario VARCHAR(255) NOT NULL UNIQUE,
    imagem TEXT,
    senha TEXT NOT NULL,
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL
);

INSERT INTO usuarios (id, nome, email, nome_usuario, imagem, senha, createdAt, updatedAt) VALUES
(1, 'saepsaude', 'saepsaude@email.com', 'saepsaude', 'saepsaude.png', '123456', '2024-08-14 18:56:33', '2024-08-14 18:56:33'),
(2, 'usuario1', 'usuario1@email.com', 'usuario01', 'usuario01.jpg', '123456', '2024-08-14 18:58:07', '2024-08-14 18:58:07'),
(3, 'usuario2', 'usuario2@email.com', 'usuario02', 'usuario02.jpg', '123456', '2024-08-14 18:58:21', '2024-08-14 18:58:21'),
(4, 'usuario3', 'usuario3@email.com', 'usuario03', 'usuario03.jpg', '123456', '2024-08-14 18:58:35', '2024-08-14 18:58:35');

CREATE TABLE IF NOT EXISTS atividades (
    id INTEGER PRIMARY KEY AUTO_INCREMENT,
    tipo_atividade VARCHAR(50) NOT NULL,
    distancia_percorrida INTEGER NOT NULL,
    duracao_atividade INTEGER NOT NULL,
    quantidade_calorias INTEGER NOT NULL,
    usuario_id INTEGER NOT NULL,
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

INSERT INTO atividades (tipo_atividade, distancia_percorrida, duracao_atividade, quantidade_calorias, createdAt, updatedAt, usuario_id) VALUES
('caminhada', 5000, 70, 340, '2024-08-14 19:15:11', '2024-08-14 19:15:11', 1),
('caminhada', 4000, 40, 140, '2024-08-14 19:15:54', '2024-08-14 19:15:54', 2),
('caminhada', 3000, 30, 140, '2024-08-14 19:16:09', '2024-08-14 19:16:09', 3),
('caminhada', 3500, 35, 180, '2024-08-14 19:16:24', '2024-08-14 19:16:24', 4),
('corrida', 6500, 40, 280, '2024-08-14 19:17:30', '2024-08-14 19:17:30', 1),
('corrida', 5500, 50, 220, '2024-08-14 19:17:47', '2024-08-14 19:17:47', 2),
('corrida', 10000, 24, 420, '2024-08-14 19:18:18', '2024-08-14 19:18:18', 3),
('corrida', 5000, 23, 320, '2024-08-14 19:18:41', '2024-08-14 19:18:41', 4),
('trilha', 2000, 40, 420, '2024-08-14 19:20:24', '2024-08-14 19:20:24', 1),
('trilha', 3000, 45, 470, '2024-08-14 19:20:43', '2024-08-14 19:20:43', 2),
('trilha', 3500, 45, 420, '2024-08-14 19:26:04', '2024-08-14 19:26:04', 3),
('trilha', 5000, 70, 570, '2024-08-14 19:26:23', '2024-08-14 19:26:23', 4);

CREATE TABLE IF NOT EXISTS likes (
    usuario_id INTEGER NOT NULL,
    atividade_id INTEGER NOT NULL,
    PRIMARY KEY (usuario_id, atividade_id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (atividade_id) REFERENCES atividades(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS comments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    content TEXT NOT NULL,
    usuario_id INTEGER NOT NULL,
    atividade_id INTEGER NOT NULL,
    created_at DATETIME NOT NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (atividade_id) REFERENCES atividades(id) ON DELETE CASCADE
);