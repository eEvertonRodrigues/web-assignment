import { JsonController, Get, Post, Put, Delete, Param, Body, HttpError } from 'routing-controllers';
import pool from '../config/db';

@JsonController('/cities')
export class CitiesController {

  @Post('/create')
  async create(@Body() body: any) {
    try {
      const { name, zip_code, state } = body;
      const { rows } = await pool.query(
        `INSERT INTO cities (name, zip_code, state)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [name, zip_code, state]
      );
      return rows[0];
    } catch (err: any) {
      throw new HttpError(500, err.message);
    }
  }

  @Put('/update/:id')
  async update(@Param('id') id: number, @Body() body: any) {
    try {
      const { name, zip_code, state } = body;
      const { rows } = await pool.query(
        `UPDATE cities
         SET name = COALESCE($1, name),
             zip_code = COALESCE($2, zip_code),
             state = COALESCE($3, state),
             updated_at = NOW()
         WHERE id = $4 AND deleted_at IS NULL
         RETURNING *`,
        [name, zip_code, state, id]
      );
      if (rows.length === 0) throw new HttpError(404, 'City not found');
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
        `UPDATE cities
         SET deleted_at = NOW()
         WHERE id = $1 AND deleted_at IS NULL
         RETURNING *`,
        [id]
      );
      if (rows.length === 0) throw new HttpError(404, 'City not found');
      return { message: 'City successfully soft deleted', data: rows[0] };
    } catch (err: any) {
      if (err instanceof HttpError) throw err;
      throw new HttpError(500, err.message);
    }
  }

  @Get('/get/:id')
  async getOne(@Param('id') id: number) {
    try {
      const { rows } = await pool.query(
        `SELECT * FROM cities WHERE id = $1 AND deleted_at IS NULL`,
        [id]
      );
      if (rows.length === 0) throw new HttpError(404, 'City not found');
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
        `SELECT * FROM cities WHERE deleted_at IS NULL ORDER BY id`
      );
      return rows;
    } catch (err: any) {
      throw new HttpError(500, err.message);
    }
  }
}
