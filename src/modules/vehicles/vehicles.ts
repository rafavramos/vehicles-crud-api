import { Router, Request, Response } from 'express';
import db from '../database/db';
import { authenticateToken } from '../auth/auth';

const vehicles = Router();

vehicles.post('/register', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { alias, plate, company_cnpj, user_cpf } = req.body;

    const emptyFields: string[] = [];

    if (!alias) emptyFields.push('Apelido/Modelo do veículo');
    if (!plate) emptyFields.push('Placa do veículo');

    if (emptyFields.length > 0) {
      return res.status(400).json({ message: 'Enviar todos os dados obrigatórios', emptyFields });
    }

    if (company_cnpj && user_cpf) {
      return res.status(400).json({ message: 'Você deve enviar apenas um usuário ou empresa, enviado empresa e funcionário' });
    }

    const vehicleExists = await db.query('SELECT * FROM vehicles WHERE plate = $1', [plate]);

    if (vehicleExists.rows.length > 0) {
      return res.status(400).json({ message: 'O veículo com a placa informada já existe.' });
    }

    if (user_cpf) {
      const userExists = await db.query('SELECT * FROM users WHERE cpf = $1', [user_cpf]);

      if (userExists.rows.length == 0) {
        return res.status(400).json({ message: 'O usuário com cpf informado não existe, não é possível vincular o veículo ao mesmo.' });
      }

      await db.query('INSERT INTO vehicles (alias, plate, user_id) VALUES ($1, $2, $3)', [alias, plate, userExists.rows[0].id]);

      res.status(201).json({ message: 'Veículo cadastrado com sucesso e vinculado ao usuário.' });
    } else if (company_cnpj) {
    
      const companieExists = await db.query('SELECT * FROM companies WHERE cnpj = $1', [company_cnpj]);

      if (companieExists.rows.length == 0) {
        return res.status(400).json({ message: 'A empresa com cnpj informado não existe, não é possível vincular o veículo ao mesmo.' });
      }

       await db.query('INSERT INTO vehicles (alias, plate, company_id) VALUES ($1, $2, $3)', [alias, plate, companieExists.rows[0].id]);
      
      res.status(201).json({ message: 'Veículo cadastrado com sucesso e vinculado a empresa.' });
    } else {
       await db.query('INSERT INTO vehicles (alias, plate) VALUES ($1, $2)', [alias, plate]);
       res.status(201).json({ message: 'Veículo cadastrado com sucesso e sem vinculos.' });
    }
  } catch (error) {
    console.error('Erro ao cadastrar Empresa:', error);
    res.status(500).json({ message: 'Erro ao cadastrar Empresa' });
  }
});

vehicles.put('/update/:plate', authenticateToken,  async (req: Request, res: Response) => {
  try {
    const { alias, user_cpf, company_cnpj } = req.body;
    const plate = req.params.plate;

    const existingVehicle = await db.query('SELECT * FROM vehicles WHERE plate = $1', [plate]);

    if (existingVehicle.rows.length === 0) {
      return res.status(404).json({ message: 'Veículo não encontrado' });
    }

    if (existingVehicle.rows[0].user_id) {
      return res.status(400).json({ message: 'O veículo já está vinculado a outro usuário' });
    }

    if (existingVehicle.rows[0].company_id) {
      return res.status(400).json({ message: 'O veículo já está vinculado a outra empresa' });
    }

    const fieldsToUpdate: { [key: string]: any } = {};

    if (alias) fieldsToUpdate.alias = alias;
    if (company_cnpj) {
      const companieExists = await db.query('SELECT * FROM companies WHERE cnpj = $1', [company_cnpj]);

      if (companieExists.rows.length == 0) {
        return res.status(400).json({ message: 'A empresa com cnpj informado não existe, não é possível vincular o veículo ao mesmo.' });
      }

      fieldsToUpdate.company_id = companieExists.rows[0].id;
    }
    if (user_cpf) {
      const userExists = await db.query('SELECT * FROM users WHERE cpf = $1', [user_cpf]);

      if (userExists.rows.length == 0) {
        return res.status(400).json({ message: 'O usuário com cpf informado não existe, não é possível vincular o veículo ao mesmo.' });
      }

      fieldsToUpdate.user_id = userExists.rows[0].id;
    }


    const vehicleWithSamePlate = await db.query('SELECT * FROM vehicles WHERE plate = $1 AND id != $2', [plate, existingVehicle.rows[0].id]);

    if (vehicleWithSamePlate.rows.length > 0) {
      return res.status(400).json({ message: 'Já existe outro veículo com a placa informada' });
    }

    const updateQuery = Object.keys(fieldsToUpdate).map((key, index) => `${key} = $${index + 1}`).join(', ');
    const updateValues = Object.values(fieldsToUpdate);

    await db.query(`UPDATE vehicles SET ${updateQuery} WHERE plate = $${updateValues.length + 1}`, [...updateValues, plate]);

    res.status(200).json({ message: 'Veículo atualizado com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar veículo:', error);
    res.status(500).json({ message: 'Erro ao atualizar veículo' });
  }
});

  vehicles.delete('/delete/:plate', authenticateToken, async (req: Request, res: Response) => {
    try {
      const plate = req.params.plate;
  
      const existingVehicle = await db.query('SELECT * FROM vehicles WHERE plate = $1', [plate]);
  
      if (existingVehicle.rows.length === 0) {
        return res.status(404).json({ message: 'Veículo não encontrado' });
      }
  
      await db.query('DELETE FROM vehicles WHERE plate = $1', [plate]);
  
      return res.status(200).json({ message: 'Veículo deletado com sucesso' });
  
    } catch (error) {
      console.error('Erro ao deletar veículo:', error);
      res.status(500).json({ message: 'Erro ao deletar veículo' });
    }
  });
  

export default vehicles;