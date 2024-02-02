import { Router, Request, Response } from 'express';
import db from '../database/db';

const companies = Router();

companies.post('/register', async (req: Request, res: Response) => {
  try {
    const { trade_name, cnpj, phone, mail, user_cpf } = req.body;

    const emptyFields: string[] = [];

    if (!trade_name) emptyFields.push('Razão Social/Nome Comercial');
    if (!cnpj) emptyFields.push('CNPJ');
    if (!phone) emptyFields.push('Telefone');
    if (!mail) emptyFields.push('E-mail');

    if (emptyFields.length > 0) {
      return res.status(400).json({ message: 'Enviar todos os dados obrigatórios', emptyFields });
    }

    const companieExists = await db.query('SELECT * FROM companies WHERE cnpj = $1', [cnpj]);

    if (companieExists.rows.length > 0) {
      return res.status(400).json({ message: 'A empresa com cnpj informado já existe' });
    }

    if (user_cpf) {
      const userExists = await db.query('SELECT * FROM users WHERE cpf = $1', [user_cpf]);

      if (userExists.rows.length == 0) {
        return res.status(400).json({ message: 'O usuário com cpf informado não existe, não é possível vincular a empresa ao mesmo.' });
      }

      const companie = await db.query('INSERT INTO companies (trade_name, cnpj, phone, mail) VALUES ($1, $2, $3, $4) RETURNING id', [trade_name, cnpj, phone, mail]);

      await db.query('UPDATE users SET company_id = $1 WHERE id = $2', [companie.rows[0].id, userExists.rows[0].id]);

      res.status(201).json({ message: 'Empresa cadastrada com sucesso e vinculada ao usuário.' });
    } else {
      await db.query('INSERT INTO companies (trade_name, cnpj, phone, mail) VALUES ($1, $2, $3, $4)', [trade_name, cnpj, phone, mail]);

      res.status(201).json({ message: 'Empresa cadastrada com sucesso, não vinculada a nenhum usuário.' });
    }
  } catch (error) {
    console.error('Erro ao cadastrar Empresa:', error);
    res.status(500).json({ message: 'Erro ao cadastrar Empresa' });
  }
});

companies.put('/update/:cnpj', async (req: Request, res: Response) => {
  try {
    const { trade_name, phone, mail, cnpj, user_cpf } = req.body;
    const cnpjParam = req.params.cnpj;

    const existingCompany = await db.query('SELECT * FROM companies WHERE cnpj = $1', [cnpjParam]);

    if (existingCompany.rows.length === 0) {
      return res.status(404).json({ message: 'Empresa não encontrada' });
    }

    const fieldsToUpdate: { [key: string]: any } = {};

    if (trade_name) fieldsToUpdate.trade_name = trade_name;
    if (phone) fieldsToUpdate.phone = phone;
    if (mail) fieldsToUpdate.mail = mail;

    const companiesWithSameCnpj = await db.query('SELECT * FROM companies WHERE cnpj = $1 AND id != $2', [cnpj, existingCompany.rows[0].id]);

    if (companiesWithSameCnpj.rows.length > 0) {
      return res.status(400).json({ message: 'Já existe outra empresa com o cnpj informado' });
    } else if (cnpj) {
      fieldsToUpdate.cnpj = cnpj;
    }

    if (user_cpf) {
      const userExists = await db.query('SELECT * FROM users WHERE cpf = $1', [user_cpf]);

      if (userExists.rows.length == 0) {
        return res.status(400).json({ message: 'O usuário com cpf informado não existe, não é possível vincular a empresa ao mesmo.' });
      }

      await db.query('UPDATE users SET company_id = $1 WHERE id = $2', [existingCompany.rows[0].id, userExists.rows[0].id]);
    }

    // Atualizar os dados da empresa no banco de dados
    const updateQuery = Object.keys(fieldsToUpdate).map((key, index) => `${key} = $${index + 1}`).join(', ');
    const updateValues = Object.values(fieldsToUpdate);

    await db.query(`UPDATE companies SET ${updateQuery} WHERE cnpj = $${updateValues.length + 1}`, [...updateValues, cnpjParam]);

    res.status(200).json({ message: 'Empresa atualizada com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar empresa:', error);
    res.status(500).json({ message: 'Erro ao atualizar empresa' });
  }
});

companies.delete('/delete/:cnpj', async (req: Request, res: Response) => {
  try {
    const cnpj = req.params.cnpj;

    // Verificar se a empresa com o CNPJ fornecido existe
    const existingCompany = await db.query('SELECT * FROM companies WHERE cnpj = $1', [cnpj]);

    if (existingCompany.rows.length === 0) {
      return res.status(404).json({ message: 'Empresa não encontrada' });
    }

    await db.query('DELETE FROM companies WHERE cnpj = $1', [cnpj]);

    res.status(200).json({ message: 'Empresa deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar empresa:', error);
    res.status(500).json({ message: 'Erro ao deletar empresa' });
  }
});

export default companies;