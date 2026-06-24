import { JsonController, Get, Post, Put, Delete, Param, Body, HttpError } from 'routing-controllers';
import pool from '../config/db';

@JsonController('/workers')
export class WorkersController {

  @Post('/create')
  async create(@Body() body: any) {
    try {
      const { phone, name, email, role, status, address_id } = body;
      const { rows } = await pool.query(
        `INSERT INTO workers (phone, name, email, role, status, address_id)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [phone, name, email, role, status ?? 'available', address_id]
      );
      return rows[0];
    } catch (err: any) {
      throw new HttpError(500, err.message);
    }
  }

  @Put('/update/:id')
  async update(@Param('id') id: number, @Body() body: any) {
    try {
      const { phone, name, email, role, status, address_id } = body;
      const { rows } = await pool.query(
        `UPDATE workers
         SET phone = COALESCE($1, phone),
             name = COALESCE($2, name),
             email = COALESCE($3, email),
             role = COALESCE($4::ROLES, role),
             status = COALESCE($5::WORKER_STATUS, status),
             address_id = COALESCE($6, address_id),
             updated_at = NOW()
         WHERE id = $7 AND deleted_at IS NULL
         RETURNING *`,
        [phone, name, email, role, status, address_id, id]
      );
      if (rows.length === 0) throw new HttpError(404, 'Worker not found');
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
        `UPDATE workers
         SET deleted_at = NOW()
         WHERE id = $1 AND deleted_at IS NULL
         RETURNING *`,
        [id]
      );
      if (rows.length === 0) throw new HttpError(404, 'Worker not found');
      return { message: 'Worker successfully soft deleted', data: rows[0] };
    } catch (err: any) {
      if (err instanceof HttpError) throw err;
      throw new HttpError(500, err.message);
    }
  }

  @Get('/get/:id')
  async getOne(@Param('id') id: number) {
    try {
      const { rows } = await pool.query(
        `SELECT * FROM workers WHERE id = $1 AND deleted_at IS NULL`,
        [id]
      );
      if (rows.length === 0) throw new HttpError(404, 'Worker not found');
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
        `SELECT * FROM workers WHERE deleted_at IS NULL ORDER BY id`
      );
      return rows;
    } catch (err: any) {
      throw new HttpError(500, err.message);
    }
  }

  @Get('/:id/tools')
  async getTools(@Param('id') id: number) {
    try {
      const { rows } = await pool.query(
        `SELECT wt.borrowed_at, wt.returned_at, wt.condition_out, wt.condition_in,
                row_to_json(t.*) AS tool
         FROM workers_tools wt
         JOIN tools t ON t.id = wt.tool_id
         WHERE wt.worker_id = $1
         ORDER BY wt.borrowed_at DESC`,
        [id]
      );
      return rows;
    } catch (err: any) {
      throw new HttpError(500, err.message);
    }
  }

  @Get('/:id/tools/report')
  async getToolReport(@Param('id') id: number) {
    try {
      const { rows } = await pool.query(
        `SELECT
           COUNT(*) as total_borrowed,
           COUNT(*) FILTER (WHERE borrowed_at >= NOW() - INTERVAL '1 month') as borrowed_last_month,
           COUNT(*) FILTER (WHERE borrowed_at >= NOW() - INTERVAL '6 months') as borrowed_last_6_months,
           COUNT(*) FILTER (WHERE returned_at IS NOT NULL) as total_returned,
           COUNT(*) FILTER (WHERE returned_at IS NULL) as currently_borrowed,
           COUNT(*) FILTER (WHERE condition_in = 'broken') as broken_tools,
           COUNT(*) FILTER (WHERE condition_in = 'lost') as lost_tools
         FROM workers_tools
         WHERE worker_id = $1`,
        [id]
      );
      if (!rows[0]) throw new HttpError(404, 'Worker not found');
      return rows[0];
    } catch (err: any) {
      throw new HttpError(500, err.message);
    }
  }

  @Get('/:id/services')
  async getServices(@Param('id') id: number) {
    try {
      const { rows } = await pool.query(
        `SELECT ws.assigned_at, ws.unassigned_at,
                row_to_json(s.*) AS services
         FROM workers_services ws
         JOIN services s ON s.id = ws.service_id
         WHERE ws.worker_id = $1
         ORDER BY ws.assigned_at DESC`,
        [id]
      );
      return rows;
    } catch (err: any) {
      throw new HttpError(500, err.message);
    }
  }

  @Post('/:id/hours')
  async logHours(@Param('id') id: number, @Body() body: any) {
    try {
      const { date, hours_worked } = body;
      if (!date || hours_worked == null) {
        throw new HttpError(400, 'date and hours_worked are required');
      }
      const { rows } = await pool.query(
        `INSERT INTO work_logs (worker_id, date, hours_worked)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [id, date, hours_worked]
      );
      return rows[0];
    } catch (err: any) {
      if (err instanceof HttpError) throw err;
      throw new HttpError(500, err.message);
    }
  }
}
