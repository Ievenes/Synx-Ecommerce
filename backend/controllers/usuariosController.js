const db = require('../db');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const listarUsuarios = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        id_usuario, 
        nome_completo, 
        email, 
        nivel_acesso, 
        data_criacao
      FROM usuarios
      ORDER BY data_criacao DESC
    `);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Erro ao listar usuários:', err.message);
    res.status(500).json({ erro: 'Erro interno no servidor' });
  }
};

const criarUsuario = async (req, res) => {
  const {
    nome_completo, email, senha, nivel_acesso = 'user',
    telefone = null, cpf = null, data_nascimento = null,
    genero = null, foto_perfil = null
  } = req.body;

  // ⚠️ Validação dos campos obrigatórios
  if (!nome_completo || !email || !senha) {
    return res.status(400).json({ erro: 'Campos obrigatórios: nome_completo, email, senha' });
  }

  try {
    const existe = await db.query('SELECT 1 FROM usuarios WHERE email = $1', [email]);
    if (existe.rows.length > 0) {
      return res.status(409).json({ erro: 'Email já cadastrado' });
    }

    const id = uuidv4();
    const senha_hash = await bcrypt.hash(senha, 10);

    const result = await db.query(`
      INSERT INTO usuarios (
        id_usuario, nome_completo, email, senha_hash, nivel_acesso,
        data_criacao, telefone, cpf, data_nascimento, genero, foto_perfil
      ) VALUES (
        $1, $2, $3, $4, $5,
        NOW(), $6, $7, $8, $9, $10
      )
      RETURNING id_usuario, nome_completo, email, nivel_acesso, data_criacao
    `, [
      id, nome_completo, email, senha_hash, nivel_acesso,
      telefone, cpf, data_nascimento, genero, foto_perfil
    ]);

    res.status(201).json(result.rows[0]);

  } catch (err) {
    console.error('Erro ao criar usuário:', err.message);
    res.status(500).json({ erro: 'Erro interno no servidor' });
  }
};

const atualizarUsuario = async (req, res) => {
  const { id } = req.params;
  const {
    nome_completo, email, senha, nivel_acesso,
    telefone, cpf, data_nascimento, genero, foto_perfil
  } = req.body;

  try {
    // Verifica se o usuário existe
    const existe = await db.query('SELECT * FROM usuarios WHERE id_usuario = $1', [id]);
    if (existe.rows.length === 0) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    // Verifica se o email já está sendo utilizado por outro usuário
    if (email && email !== existe.rows[0].email) {
      const existeEmail = await db.query(
        'SELECT 1 FROM usuarios WHERE email = $1 AND id_usuario <> $2',
        [email, id]
      );
      if (existeEmail.rows.length > 0) {
        return res.status(409).json({ erro: 'Email já cadastrado' });
      }
    }

    // Se nova senha for enviada, faz o hash
    let senha_hash = existe.rows[0].senha_hash;
    if (senha) {
      senha_hash = await bcrypt.hash(senha, 10);
    }

    const result = await db.query(
      `UPDATE usuarios SET 
        nome_completo = $1,
        email = $2,
        senha_hash = $3,
        nivel_acesso = $4,
        telefone = $5,
        cpf = $6,
        data_nascimento = $7,
        genero = $8,
        foto_perfil = $9,
        ultima_atualizacao = NOW()
      WHERE id_usuario = $10
      RETURNING id_usuario, nome_completo, email, nivel_acesso, telefone, cpf, data_nascimento, genero, foto_perfil, data_criacao`,
      [
        nome_completo, email, senha_hash, nivel_acesso,
        telefone, cpf, data_nascimento, genero, foto_perfil, id
      ]
    );

    res.status(200).json(result.rows[0]);

  } catch (err) {
    console.error('Erro ao atualizar usuário:', err.message);
    res.status(500).json({ erro: 'Erro interno no servidor' });
  }
};

const removerUsuario = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      'DELETE FROM usuarios WHERE id_usuario = $1 RETURNING id_usuario',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    res.status(200).json({ mensagem: 'Usuário removido com sucesso' });

  } catch (err) {
    console.error('Erro ao remover usuário:', err.message);
    res.status(500).json({ erro: 'Erro interno no servidor' });
  }
};

const loginUsuario = async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ erro: 'Email e senha são obrigatórios' });
  }

  try {
    const result = await db.query('SELECT * FROM usuarios WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ erro: 'Credenciais inválidas' });
    }

    const usuario = result.rows[0];
    const senhaCorreta = await bcrypt.compare(senha, usuario.senha_hash);

    if (!senhaCorreta) {
      return res.status(401).json({ erro: 'Credenciais inválidas' });
    }

    // Gera o token JWT
    const token = jwt.sign(
      {
        id_usuario: usuario.id_usuario,
        nome_completo: usuario.nome_completo,
        nivel_acesso: usuario.nivel_acesso,
        data_criacao: usuario.data_criacao,
        foto_perfil: usuario.foto_perfil,
        telefone: usuario.telefone,
        genero: usuario.genero,
        cpf: usuario.cpf,
        data_nascimento: usuario.data_nascimento
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRATION || '1h' }
    );

    res.status(200).json({
      token,
      usuario: {
        id_usuario: usuario.id_usuario,
        nome_completo: usuario.nome_completo,
        email: usuario.email,
        nivel_acesso: usuario.nivel_acesso,
        data_criacao: usuario.data_criacao,
        foto_perfil: usuario.foto_perfil,
        telefone: usuario.telefone,
        genero: usuario.genero,
        cpf: usuario.cpf,
        data_nascimento: usuario.data_nascimento
        // adicione aqui mais campos se quiser
      }
    });

  } catch (err) {
    console.error('Erro no login:', err.message);
    res.status(500).json({ erro: 'Erro interno no servidor' });
  }
};

const atualizarNivelAcesso = async (req, res) => {
  const { id } = req.params;
  const { nivel_acesso } = req.body;

  if (!nivel_acesso) {
    return res.status(400).json({ erro: 'Nível de acesso é obrigatório' });
  }

  try {
    const existe = await db.query('SELECT 1 FROM usuarios WHERE id_usuario = $1', [id]);
    if (existe.rowCount === 0) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    await db.query(`
      UPDATE usuarios 
      SET nivel_acesso = $1, ultima_atualizacao = NOW() 
      WHERE id_usuario = $2
    `, [nivel_acesso, id]);

    res.status(200).json({ mensagem: 'Nível de acesso atualizado com sucesso' });

  } catch (err) {
    console.error('Erro ao atualizar nível de acesso:', err.message);
    res.status(500).json({ erro: 'Erro interno no servidor' });
  }
};

module.exports = {
  listarUsuarios,
  criarUsuario,
  atualizarUsuario,
  removerUsuario,
  loginUsuario,
  atualizarNivelAcesso
};
