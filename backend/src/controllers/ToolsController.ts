import { JsonController, Get, Post, Put, Delete, Param, Body, HttpError } from 'routing-controllers';
import pool from '../config/db';

@JsonController('/tools')
export class ToolsController {

  @Post('/create')
  async create(@Body() body: any) {
    try {
      const { name, description, status } = body;
      const { rows } = await pool.query(
        `INSERT INTO tools (name, description, status)
         VALUES ($1, $2, $3::TOOL_STATUS)
         RETURNING *`,
        [name, description ?? null, status]
      );
      return rows[0];
    } catch (err: any) {
      throw new HttpError(500, err.message);
    }
  }

  @Put('/update/:id')
  async update(@Param('id') id: number, @Body() body: any) {
    try {
      const { name, description, status } = body;
      const { rows } = await pool.query(
        `UPDATE tools
         SET name = COALESCE($1, name),
             description = COALESCE($2, description),
             status = COALESCE($3::TOOL_STATUS, status),
             updated_at = NOW()
         WHERE id = $4 AND deleted_at IS NULL
         RETURNING *`,
        [name, description, status, id]
      );
      if (rows.length === 0) throw new HttpError(404, 'Tool not found');
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
        `UPDATE tools
         SET deleted_at = NOW()
         WHERE id = $1 AND deleted_at IS NULL
         RETURNING *`,
        [id]
      );
      if (rows.length === 0) throw new HttpError(404, 'Tool not found');
      return { message: 'Tool successfully soft deleted', data: rows[0] };
    } catch (err: any) {
      if (err instanceof HttpError) throw err;
      throw new HttpError(500, err.message);
    }
  }

  @Get('/get/:id')
  async getOne(@Param('id') id: number) {
    try {
      const { rows } = await pool.query(
        `SELECT * FROM tools WHERE id = $1 AND deleted_at IS NULL`,
        [id]
      );
      if (rows.length === 0) throw new HttpError(404, 'Tool not found');
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
        `SELECT * FROM tools WHERE deleted_at IS NULL ORDER BY id`
      );
      return rows;
    } catch (err: any) {
      throw new HttpError(500, err.message);
    }
  }

  @Put('/:id/assign/:workerId')
  async assign(@Param('id') id: number, @Param('workerId') workerId: number, @Body() body: any) {
    try {
      const { rows: toolRows } = await pool.query(
        `SELECT * FROM tools WHERE id = $1 AND deleted_at IS NULL`,
        [id]
      );
      if (toolRows.length === 0) throw new HttpError(404, 'Tool not found');

      const tool = toolRows[0];
      if (tool.status === 'occupied') {
        throw new HttpError(400, 'Tool is already assigned to a worker');
      }

      const conditionOut = body?.condition_out || tool.status;

      const { rows: updatedTool } = await pool.query(
        `UPDATE tools SET status = 'occupied', updated_at = NOW() WHERE id = $1 RETURNING *`,
        [id]
      );
      await pool.query(
        `INSERT INTO workers_tools (worker_id, tool_id, condition_out) VALUES ($1, $2, $3::TOOL_STATUS)`,
        [workerId, id, conditionOut]
      );

      return updatedTool[0];
    } catch (err: any) {
      if (err instanceof HttpError) throw err;
      throw new HttpError(500, err.message);
    }
  }

  @Put('/:id/unassign')
  async unassign(@Param('id') id: number, @Body() body: any) {
    try {
      const { rows: toolRows } = await pool.query(
        `SELECT * FROM tools WHERE id = $1 AND deleted_at IS NULL`,
        [id]
      );
      if (toolRows.length === 0) throw new HttpError(404, 'Tool not found');

      const tool = toolRows[0];
      if (tool.status !== 'occupied') {
        throw new HttpError(400, 'Tool is not currently assigned to any worker');
      }

      const conditionIn = body?.condition_in || 'available';

      // Update tool status
      const { rows: updatedTool } = await pool.query(
        `UPDATE tools SET status = $1::TOOL_STATUS, updated_at = NOW() WHERE id = $2 RETURNING *`,
        [conditionIn, id]
      );

      // End assignment record
      await pool.query(
        `UPDATE workers_tools 
         SET returned_at = NOW(), condition_in = $1::TOOL_STATUS 
         WHERE tool_id = $2 AND returned_at IS NULL`,
        [conditionIn, id]
      );

      return updatedTool[0];
    } catch (err: any) {
      if (err instanceof HttpError) throw err;
      throw new HttpError(500, err.message);
    }
  }
}
