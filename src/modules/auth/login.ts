// src/routes/auth.ts
import { Router, Request, Response } from 'express';
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
import db from '../database/db'; 

const login = Router();

// Rota de autenticação de usuário
login.post('/login', async (req: Request, res: Response) => {
  try {
    const { cpf, password } = req.body;

    // Verifique se o usuário existe no banco de dados
    const user = await db.query('SELECT * FROM users WHERE cpf = $1', [cpf]);

    if (user.rows.length === 0) {
      return res.status(400).json({ message: 'Usuário não encontrado' });
    }

    // Verifique se a senha está correta
    const hashedPassword = user.rows[0].password;
    const passwordMatch = await bcrypt.compare(password, hashedPassword);

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Senha incorreta' });
    }

    // Gere um token de autenticação JWT
    const token = jwt.sign({ userId: user.rows[0].id }, 'seu_token_secreto');

    res.status(200).json({ message: 'Usuário autenticado com sucesso', token });
  } catch (error) {
    console.error('Erro ao autenticar usuário:', error);
    res.status(500).json({ message: 'Erro ao autenticar usuário' });
  }
});

export default login;