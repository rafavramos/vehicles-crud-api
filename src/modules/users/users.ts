// src/routes/auth.ts
import { Router, Request, Response } from 'express';
import db from '../database/db';
const bcrypt = require('bcryptjs');
import { authenticateToken } from '../auth/auth';

const users = Router();

users.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, password, cpf, phone, mail } = req.body;

    const emptyFields: string[] = [];

    if (!name) emptyFields.push('Nome');
    if (!password) emptyFields.push('Senha');
    if (!cpf) emptyFields.push('CPF');
    if (!phone) emptyFields.push('Telefone');
    if (!mail) emptyFields.push('E-mail');

    if (emptyFields.length > 0) {
      return res.status(400).json({ message: 'Enviar todos os dados obrigatórios', emptyFields });
    }

    const userExists = await db.query('SELECT * FROM users WHERE cpf = $1', [cpf]);

    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: 'O usuário com cpf informado já existe' });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    await db.query('INSERT INTO users (name, password, cpf, phone, mail) VALUES ($1, $2, $3, $4, $5)', [name, hashedPassword, cpf, phone, mail]);

    res.status(201).json({ message: 'Usuário cadastrado com sucesso' });
  } catch (error) {
    console.error('Erro ao cadastrar usuário:', error);
    res.status(500).json({ message: 'Erro ao cadastrar usuário' });
  }
});

users.put('/update/:cpf', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { name, password, phone, mail, company_cnpj } = req.body;
    const cpf = req.params.cpf;

    const existingUser = await db.query('SELECT * FROM users WHERE cpf = $1', [cpf]);

    if (existingUser.rows.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    const fieldsToUpdate: { [key: string]: any } = {};

    if (name) fieldsToUpdate.name = name;
    if (password) {
      const saltRounds = 10;
      fieldsToUpdate.password = await bcrypt.hash(password, saltRounds);
    }
    if (phone) fieldsToUpdate.phone = phone;
    if (mail) fieldsToUpdate.mail = mail;
    if (company_cnpj) {
      const existingCompany = await db.query('SELECT * FROM companies WHERE cnpj = $1', [company_cnpj]);

      if (existingCompany.rows.length === 0) {
        return res.status(404).json({ message: 'Empresa não encontrada' });
      }

      fieldsToUpdate.comapny_id = existingCompany.rows[0].id;
    }

    const userWithSameCpf = await db.query('SELECT * FROM users WHERE cpf = $1 AND id != $2', [cpf, existingUser.rows[0].id]);

    if (userWithSameCpf.rows.length > 0) {
      return res.status(400).json({ message: 'Já existe outro usuário com o CPF informado' });
    }

    const updateQuery = Object.keys(fieldsToUpdate).map((key, index) => `${key} = $${index + 1}`).join(', ');
    const updateValues = Object.values(fieldsToUpdate);

    await db.query(`UPDATE users SET ${updateQuery} WHERE cpf = $${updateValues.length + 1}`, [...updateValues, cpf]);

    res.status(200).json({ message: 'Usuário atualizado com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ message: 'Erro ao atualizar usuário' });
  }
});

users.delete('/delete/:cpf', authenticateToken, async (req: Request, res: Response) => {
  try {
    const cpf = req.params.cpf;

    const existingUser = await db.query('SELECT * FROM users WHERE cpf = $1', [cpf]);

    if (existingUser.rows.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    await db.query('DELETE FROM users WHERE cpf = $1', [cpf]);

    res.status(200).json({ message: 'Usuário deletado com sucesso ' });
  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    res.status(500).json({ message: 'Erro ao deletar usuário' });
  }
});

export default users;