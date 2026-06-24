import { JsonController, Get, Post, Put, Delete, Param, Body, HttpError } from 'routing-controllers';
import pool from '../config/db';

@JsonController('/clients')
export class ClientsController {

  @Post('/create')
  async create(@Body() body: any) {
    try {
      const { name, email, phone, address_id } = body;
      const { rows } = await pool.query(
        `INSERT INTO clients (name, email, phone, address_id)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [name, email, phone, address_id ?? null]
      );
      return rows[0];
    } catch (err: any) {
      throw new HttpError(500, err.message);
    }
  }

  @Put('/update/:id')
  async update(@Param('id') id: number, @Body() body: any) {
    try {
      const { name, email, phone, address_id } = body;
      const { rows } = await pool.query(
        `UPDATE clients
         SET name = COALESCE($1, name),
             email = COALESCE($2, email),
             phone = COALESCE($3, phone),
             address_id = COALESCE($4, address_id),
             updated_at = NOW()
         WHERE id = $5 AND deleted_at IS NULL
         RETURNING *`,
        [name, email, phone, address_id, id]
      );
      if (rows.length === 0) throw new HttpError(404, 'Client not found');
      return rows[0];
    } catch (err: any) {
      if (err instanceof HttpError) throw err;
      throw new HttpError(500, err.message);
    }
  }

  @Delete('/delete/:id')
  async remove(@Param('id') id: number) {
    try {
      const { rows } = await pool.query(
        `UPDATE clients
         SET deleted_at = NOW()
         WHERE id = $1 AND deleted_at IS NULL
         RETURNING *`,
        [id]
      );
      if (rows.length === 0) throw new HttpError(404, 'Client not found');
      return { message: 'Client successfully soft deleted', data: rows[0] };
    } catch (err: any) {
      if (err instanceof HttpError) throw err;
      throw new HttpError(500, err.message);
    }
  }

  @Get('/get/:id')
  async getOne(@Param('id') id: number) {
    try {
      const { rows } = await pool.query(
        `SELECT * FROM clients WHERE id = $1 AND deleted_at IS NULL`,
        [id]
      );
      if (rows.length === 0) throw new HttpError(404, 'Client not found');
      return rows[0];
    } catch (err: any) {
      if (err instanceof HttpError) throw err;
      throw new HttpError(500, err.message);
    }
  }

  @Get('/all')
  async getAll() {
    try {
      const { rows } = await pool.query(
        `SELECT * FROM clients WHERE deleted_at IS NULL ORDER BY id`
      );
      return rows;
    } catch (err: any) {
      throw new HttpError(500, err.message);
    }
  }
}
