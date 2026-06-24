import { JsonController, Get, Post, Put, Delete, Param, Body, HttpError } from 'routing-controllers';
import pool from '../config/db';

@JsonController('/address')
export class AddressController {

  @Post('/create')
  async create(@Body() body: any) {
    try {
      const { street, number, neighborhood, city_id } = body;
      const { rows } = await pool.query(
        `INSERT INTO address (street, number, neighborhood, city_id)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [street, number, neighborhood, city_id]
      );
      return rows[0];
    } catch (err: any) {
      throw new HttpError(500, err.message);
    }
  }

  @Put('/update/:id')
  async update(@Param('id') id: number, @Body() body: any) {
    try {
      const { street, number, neighborhood, city_id } = body;
      const { rows } = await pool.query(
        `UPDATE address
         SET street = COALESCE($1, street),
             number = COALESCE($2, number),
             neighborhood = COALESCE($3, neighborhood),
             city_id = COALESCE($4, city_id),
             updated_at = NOW()
         WHERE id = $5 AND deleted_at IS NULL
         RETURNING *`,
        [street, number, neighborhood, city_id, id]
      );
      if (rows.length === 0) throw new HttpError(404, 'Address not found');
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
        `UPDATE address
         SET deleted_at = NOW()
         WHERE id = $1 AND deleted_at IS NULL
         RETURNING *`,
        [id]
      );
      if (rows.length === 0) throw new HttpError(404, 'Address not found');
      return { message: 'Address successfully soft deleted', data: rows[0] };
    } catch (err: any) {
      if (err instanceof HttpError) throw err;
      throw new HttpError(500, err.message);
    }
  }

  @Get('/get/:id')
  async getOne(@Param('id') id: number) {
    try {
      const { rows } = await pool.query(
        `SELECT * FROM address WHERE id = $1 AND deleted_at IS NULL`,
        [id]
      );
      if (rows.length === 0) throw new HttpError(404, 'Address not found');
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
        `SELECT * FROM address WHERE deleted_at IS NULL ORDER BY id`
      );
      return rows;
    } catch (err: any) {
      throw new HttpError(500, err.message);
    }
  }
}
