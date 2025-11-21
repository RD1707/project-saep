import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import sequelize from './db.js'; 
import { Usuario, Atividade, Like, Comment } from './models.js'; 

const app = express(); 
const PORT = 3025;     

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

async function verificarEPovoarBanco() {
    try {
        const totalUsuarios = await Usuario.count();
        if (totalUsuarios > 0) {
            console.log("O banco de dados já contém dados. Importação ignorada.");
            return;
        }

        console.log("Banco vazio detectado. Iniciando importação dos CSVs...");

        if (fs.existsSync('./assets/usuario.csv')) {
            const usuariosData = fs.readFileSync('./assets/usuario.csv', 'utf8');
            const linhasUsuarios = usuariosData.split(/\r?\n/); 

            for (let i = 1; i < linhasUsuarios.length; i++) { 
                const linha = linhasUsuarios[i].trim();
                if (!linha) continue;

                const col = linha.split(',');
                if(col.length >= 6) {
                      await Usuario.create({
                        id: parseInt(col[0]),
                        nome: col[1],
                        email: col[2],
                        nome_usuario: col[3],
                        imagem: col[4],
                        senha: col[5],
                        createdAt: col[6] ? new Date(col[6]) : new Date(),
                        updatedAt: col[7] ? new Date(col[7]) : new Date()
                    });
                }
            }
            console.log("Usuários importados com sucesso!");
        } else {
            console.log("Arquivo usuario.csv não encontrado em /assets");
        }

        if (fs.existsSync('./assets/atividade.csv')) {
            const atividadesData = fs.readFileSync('./assets/atividade.csv', 'utf8');
            const linhasAtividades = atividadesData.split(/\r?\n/);

            for (let i = 1; i < linhasAtividades.length; i++) {
                const linha = linhasAtividades[i].trim();
                if (!linha) continue;

                const col = linha.split(',');
                if(col.length >= 7) {
                    await Atividade.create({
                        tipo_atividade: col[0],
                        distancia_percorrida: parseInt(col[1]),
                        duracao_atividade: parseInt(col[2]),
                        quantidade_calorias: parseInt(col[3]),
                        createdAt: col[4] ? new Date(col[4]) : new Date(),
                        updatedAt: col[5] ? new Date(col[5]) : new Date(),
                        usuario_id: parseInt(col[6])
                    });
                }
            }
            console.log("Atividades importadas com sucesso!");
        } else {
            console.log("Arquivo atividade.csv não encontrado em /assets");
        }

    } catch (error) {
        console.error("Erro ao tentar importar dados:", error);
    }
}

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/atividades', async (req, res) => {
    const pagina = parseInt(req.query.pagina) || 1;
    const filtroTipo = req.query.tipo; 
    const itensPorPagina = 4;
    const offset = (pagina - 1) * itensPorPagina;

    try {
        const whereCondition = {};
        if (filtroTipo && ['corrida', 'caminhada', 'trilha'].includes(filtroTipo.toLowerCase())) {
            whereCondition.tipo_atividade = filtroTipo; 
        }

        const { count, rows: data } = await Atividade.findAndCountAll({
            where: whereCondition,
            limit: itensPorPagina,
            offset: offset,
            order: [['createdAt', 'DESC']],
            include: [
                { model: Usuario, as: 'usuario', attributes: ['nome_usuario', 'imagem'] },
                { model: Like, as: 'likes', attributes: ['usuario_id'] },
                { model: Comment, as: 'comments', attributes: ['id'] }
            ],
            distinct: true 
        });

        const atividadesFormatadas = data.map(atividadeInstance => {
            const item = atividadeInstance.toJSON();
            const likesArray = item.likes || [];
            const commentsArray = item.comments || [];
            
            return {
                ...item,
                usuario_id: item.usuario || { nome_usuario: 'Desconhecido', imagem: 'SAEPSaude.png' },
                usuariosQueCurtiram: likesArray.map(l => l.usuario_id),
                totalLikes: likesArray.length,
                totalComentarios: commentsArray.length,
                comentarios: [] 
            };
        });

        const totalPaginas = Math.ceil(count / itensPorPagina);

        res.status(200).send({
            atividades: atividadesFormatadas,
            totalPaginas: totalPaginas
        });

    } catch (e) {
        console.error('Erro ao buscar atividades:', e);
        res.status(500).send({ message: 'Erro interno.' });
    }
});

app.post('/atividades', async (req, res) => {
    const { tipo_atividade, distancia_percorrida, duracao_atividade, quantidade_calorias, usuario_id } = req.body;
    try {
        await Atividade.create({
            tipo_atividade,
            distancia_percorrida: parseInt(distancia_percorrida),
            duracao_atividade: parseInt(duracao_atividade),
            quantidade_calorias: parseInt(quantidade_calorias),
            usuario_id: parseInt(usuario_id)
        });
        res.status(201).json({ mensagem: "Atividade registrada!" });
    } catch (error) {
        res.status(500).json({ erro: "Falha ao registrar." });
    }
});

app.post('/login', async (req, res) => {
    const { email, senha } = req.body;
    try {
        const usuarioInstance = await Usuario.findOne({
            where: { email: email, senha: senha }
        });
        if (!usuarioInstance) return res.status(401).json({ erro: "Dados inválidos" });

        const usuario = usuarioInstance.toJSON();
        const totalAtividades = await Atividade.count({ where: { usuario_id: usuario.id } });
        
        const caloriasData = await Atividade.findAll({
            where: { usuario_id: usuario.id },
            attributes: ['quantidade_calorias']
        });
        const totalCalorias = caloriasData.reduce((acc, curr) => acc + curr.quantidade_calorias, 0);

        res.status(200).json({
            ...usuario,
            stats: { totalAtividades: totalAtividades || 0, totalCalorias: totalCalorias }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: "Erro no login" });
    }
});

app.get('/minhas-atividades', async (req, res) => {
    const usuarioId = req.query.usuarioId;
    if (!usuarioId) return res.status(400).send({ erro: "ID obrigatório." });

    try {
        const data = await Atividade.findAll({
            where: { usuario_id: usuarioId }, 
            order: [['createdAt', 'DESC']],
            include: [
                { model: Usuario, as: 'usuario', attributes: ['nome_usuario', 'imagem'] },
                { model: Like, as: 'likes', attributes: ['usuario_id'] },
                { model: Comment, as: 'comments', attributes: ['id'] }
            ]
        });

        const atividadesFormatadas = data.map(item => {
            const atividade = item.toJSON();
            return {
                ...atividade,
                usuario_id: atividade.usuario,
                usuariosQueCurtiram: (atividade.likes || []).map(l => l.usuario_id),
                totalLikes: (atividade.likes || []).length,
                totalComentarios: (atividade.comments || []).length,
            };
        });

        res.status(200).json(atividadesFormatadas);
    } catch (e) {
        res.status(500).send({ erro: 'Erro interno.' });
    }
});

app.post('/atividades/:id/like', async (req, res) => {
    try {
        const { usuarioId } = req.body;
        const atividadeId = req.params.id;
        
        const deleted = await Like.destroy({ where: { usuario_id: usuarioId, atividade_id: atividadeId } });
        if (deleted) return res.status(200).json({ acao: 'removido' });

        await Like.create({ usuario_id: usuarioId, atividade_id: atividadeId });
        return res.status(201).json({ acao: 'adicionado' });
    } catch (e) {
        res.status(500).json({ erro: 'Erro no like' });
    }
});

app.post('/atividades/:id/comentarios', async (req, res) => {
    try {
        const novo = await Comment.create({
            content: req.body.conteudo,
            usuario_id: req.body.usuarioId,
            atividade_id: req.params.id
        });
        res.status(201).json(novo);
    } catch (e) {
        res.status(500).json({ erro: 'Erro ao comentar' });
    }
});

app.get('/atividades/:id/comentarios', async (req, res) => {
    try {
        const data = await Comment.findAll({
            where: { atividade_id: req.params.id },
            include: [{ model: Usuario, as: 'usuario', attributes: ['nome_usuario', 'imagem'] }],
            order: [['created_at', 'DESC']]
        });
        res.status(200).json({ total: data.length, comentarios: data });
    } catch (e) {
        res.status(500).json({ erro: 'Erro ao buscar comentários' });
    }
});

app.listen(PORT, async () => {
    console.log(`Server is running in http://localhost:${PORT}`);

    try {
        await sequelize.sync(); 
        console.log('Banco de dados sincronizado.');

        await verificarEPovoarBanco();

    } catch (error) {
        console.error('Erro na inicialização:', error);
    }
});