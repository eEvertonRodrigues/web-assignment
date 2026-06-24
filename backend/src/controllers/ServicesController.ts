import { JsonController, Get, Post, Put, Delete, Param, Body, HttpError } from 'routing-controllers';
import pool from '../config/db';

@JsonController('/services')
export class ServicesController {

  @Post('/create')
  async create(@Body() body: any) {
    try {
      const { name, type, status, value, address_id, client_id } = body;
      const { rows } = await pool.query(
        `INSERT INTO services (name, type, status, value, address_id, client_id)
         VALUES ($1, $2::SERVICE_TYPE, $3::SERVICE_STATUS, $4, $5, $6)
         RETURNING *`,
        [name, type, status ?? 'pending', value, address_id, client_id]
      );
      return rows[0];
    } catch (err: any) {
      throw new HttpError(500, err.message);
    }
  }

  @Put('/update/:id')
  async update(@Param('id') id: number, @Body() body: any) {
    try {
      const { name, type, status, value, address_id, client_id } = body;
      const { rows } = await pool.query(
        `UPDATE services
         SET name = COALESCE($1, name),
             type = COALESCE($2::SERVICE_TYPE, type),
             status = COALESCE($3::SERVICE_STATUS, status),
             value = COALESCE($4, value),
             address_id = COALESCE($5, address_id),
             client_id = COALESCE($6, client_id),
             updated_at = NOW()
         WHERE id = $7 AND deleted_at IS NULL
         RETURNING *`,
        [name, type, status, value, address_id, client_id, id]
      );
      if (rows.length === 0) throw new HttpError(404, 'Service not found');
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
        `UPDATE services SET deleted_at = NOW()
         WHERE id = $1 AND deleted_at IS NULL RETURNING *`,
        [id]
      );
      if (rows.length === 0) throw new HttpError(404, 'Service not found');
      return { message: 'Service successfully soft deleted', data: rows[0] };
    } catch (err: any) {
      if (err instanceof HttpError) throw err;
      throw new HttpError(500, err.message);
    }
  }

  @Get('/get/:id')
  async getOne(@Param('id') id: number) {
    try {
      const { rows } = await pool.query(
        `SELECT * FROM services WHERE id = $1 AND deleted_at IS NULL`, [id]
      );
      if (rows.length === 0) throw new HttpError(404, 'Service not found');
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
        `SELECT * FROM services WHERE deleted_at IS NULL ORDER BY id`
      );
      return rows;
    } catch (err: any) {
      throw new HttpError(500, err.message);
    }
  }

  @Post('/:id/workers/:workerId')
  async assignWorker(@Param('id') serviceId: number, @Param('workerId') workerId: number) {
    try {
      const { rows: existing } = await pool.query(
        `SELECT 1 FROM workers_services
         WHERE service_id = $1 AND worker_id = $2 AND unassigned_at IS NULL`,
        [serviceId, workerId]
      );
      if (existing.length > 0) {
        throw new HttpError(400, 'Worker is already currently assigned to this service');
      }
      const { rows } = await pool.query(
        `INSERT INTO workers_services (service_id, worker_id) VALUES ($1, $2) RETURNING *`,
        [serviceId, workerId]
      );
      return rows[0];
    } catch (err: any) {
      if (err instanceof HttpError) throw err;
      throw new HttpError(500, err.message);
    }
  }

  @Put('/:id/workers/:workerId/unassign')
  async unassignWorker(@Param('id') serviceId: number, @Param('workerId') workerId: number) {
    try {
      const { rows: existing } = await pool.query(
        `SELECT 1 FROM workers_services
         WHERE service_id = $1 AND worker_id = $2 AND unassigned_at IS NULL`,
        [serviceId, workerId]
      );
      if (existing.length === 0) {
        throw new HttpError(400, 'Worker is not currently active on this service');
      }
      const { rows } = await pool.query(
        `UPDATE workers_services SET unassigned_at = NOW()
         WHERE service_id = $1 AND worker_id = $2 AND unassigned_at IS NULL RETURNING *`,
        [serviceId, workerId]
      );
      return { message: 'Worker unassigned from service', data: rows[0] };
    } catch (err: any) {
      if (err instanceof HttpError) throw err;
      throw new HttpError(500, err.message);
    }
  }

  @Get('/:id/workers')
  async getWorkers(@Param('id') serviceId: number) {
    try {
      const { rows } = await pool.query(
        `SELECT ws.assigned_at, ws.unassigned_at, row_to_json(w.*) AS workers
         FROM workers_services ws
         JOIN workers w ON w.id = ws.worker_id
         WHERE ws.service_id = $1
         ORDER BY ws.assigned_at DESC`,
        [serviceId]
      );
      return rows;
    } catch (err: any) {
      throw new HttpError(500, err.message);
    }
  }
}
