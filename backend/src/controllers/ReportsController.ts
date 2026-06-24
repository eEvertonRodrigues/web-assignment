import { JsonController, Get, Post, QueryParam, HttpError } from 'routing-controllers';
import pool from '../config/db';

@JsonController('/reports')
export class ReportsController {

  @Get('/services')
  async getServicesReport(@QueryParam('startDate') startDate?: string, @QueryParam('endDate') endDate?: string) {
    try {
      let query = `
         SELECT 
           w.id as worker_id,
           w.name as worker_name,
           COUNT(s.id) FILTER (WHERE s.status = 'done') as completed_services,
           COUNT(s.id) FILTER (WHERE s.status = 'pending') as pending_services
         FROM workers w
         LEFT JOIN workers_services ws ON ws.worker_id = w.id
         LEFT JOIN services s ON s.id = ws.service_id
         WHERE w.deleted_at IS NULL `;
      
      const params = [];
      if (startDate && endDate) {
        query += ` AND ws.assigned_at >= $1 AND ws.assigned_at <= $2 `;
        params.push(`${startDate} 00:00:00`, `${endDate} 23:59:59`);
      }

      query += ` GROUP BY w.id, w.name ORDER BY w.name`;

      const { rows } = await pool.query(query, params);
      return rows;
    } catch (err: any) {
      throw new HttpError(500, err.message);
    }
  }

  @Get('/hours')
  async getHoursReport(@QueryParam('startDate') startDate?: string, @QueryParam('endDate') endDate?: string) {
    try {
      let query = `
         SELECT 
           w.id as worker_id,
           w.name as worker_name,
           COALESCE(SUM(wl.hours_worked), 0) as total_hours
         FROM workers w
         LEFT JOIN work_logs wl ON wl.worker_id = w.id
         WHERE w.deleted_at IS NULL `;
         
      const params = [];
      if (startDate && endDate) {
        query += ` AND wl.date >= $1 AND wl.date <= $2 `;
        params.push(startDate, endDate);
      }

      query += ` GROUP BY w.id, w.name ORDER BY w.name`;

      const { rows } = await pool.query(query, params);
      return rows;
    } catch (err: any) {
      throw new HttpError(500, err.message);
    }
  }

  @Get('/tools')
  async getToolsReport(@QueryParam('startDate') startDate?: string, @QueryParam('endDate') endDate?: string) {
    try {
      let query = `
         SELECT 
           t.id as tool_id,
           t.name as tool_name,
           t.status as current_status,
           COUNT(wt.id) as times_borrowed
         FROM tools t
         LEFT JOIN workers_tools wt ON wt.tool_id = t.id
         WHERE t.deleted_at IS NULL `;

      const params = [];
      if (startDate && endDate) {
        query += ` AND wt.borrowed_at >= $1 AND wt.borrowed_at <= $2 `;
        params.push(`${startDate} 00:00:00`, `${endDate} 23:59:59`);
      }

      query += ` GROUP BY t.id, t.name, t.status ORDER BY t.name`;

      const { rows } = await pool.query(query, params);
      return rows;
    } catch (err: any) {
      throw new HttpError(500, err.message);
    }
  }

  @Post('/graft')
  async generateRandomData() {
    try {
      const { rows: workers } = await pool.query('SELECT id FROM workers WHERE deleted_at IS NULL');
      if (workers.length === 0) return { message: 'No workers found to graft' };

      const { rows: existingLogs } = await pool.query(`SELECT worker_id, date FROM work_logs WHERE date >= NOW() - INTERVAL '30 days'`);
      const logSet = new Set(existingLogs.map(l => `${l.worker_id}-${new Date(l.date).toISOString().split('T')[0]}`));
      
      const hoursToInsert = [];
      for (let i = 0; i < 30; i++) {
        const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
        if (d.getDay() === 0 || d.getDay() === 6) continue; 
        const dateStr = d.toISOString().split('T')[0];
        
        for (const w of workers) {
          if (!logSet.has(`${w.id}-${dateStr}`)) {
            if (Math.random() > 0.1) {
              let hours = 8;
              if (Math.random() > 0.8) hours = 9;
              else if (Math.random() > 0.8) hours = 4;
              hoursToInsert.push(`(${w.id}, '${dateStr}', ${hours})`);
            }
          }
        }
      }
      
      if (hoursToInsert.length > 0) {
        await pool.query(`INSERT INTO work_logs (worker_id, date, hours_worked) VALUES ${hoursToInsert.join(',')}`);
      }

      const { rows: availableTools } = await pool.query(`SELECT id FROM tools WHERE deleted_at IS NULL AND status = 'available'`);
      const { rows: activeLoans } = await pool.query(`SELECT id, tool_id FROM workers_tools WHERE returned_at IS NULL`);
      
      for (const t of availableTools) {
        if (Math.random() > 0.5) { 
          const workerId = workers[Math.floor(Math.random() * workers.length)].id;
          await pool.query(`INSERT INTO workers_tools (worker_id, tool_id, condition_out) VALUES ($1, $2, 'available')`, [workerId, t.id]);
          await pool.query(`UPDATE tools SET status = 'occupied' WHERE id = $1`, [t.id]);
        }
      }

      for (const loan of activeLoans) {
        if (Math.random() > 0.5) { 
          const isBroken = Math.random() > 0.9 ? 'broken' : 'available';
          await pool.query(`UPDATE workers_tools SET returned_at = NOW(), condition_in = $1 WHERE id = $2`, [isBroken, loan.id]);
          await pool.query(`UPDATE tools SET status = $1 WHERE id = $2`, [isBroken, loan.tool_id]);
        }
      }

      const { rows: pendingServices } = await pool.query(`SELECT id FROM services WHERE deleted_at IS NULL AND status = 'pending'`);
      
      for (const s of pendingServices) {
        const { rows: activeWorkersInService } = await pool.query(`SELECT worker_id FROM workers_services WHERE service_id = $1 AND unassigned_at IS NULL`, [s.id]);
        
        if (activeWorkersInService.length === 0) {
          if (Math.random() > 0.2) { 
            const workerId = workers[Math.floor(Math.random() * workers.length)].id;
            await pool.query(`INSERT INTO workers_services (worker_id, service_id, assigned_at) VALUES ($1, $2, NOW())`, [workerId, s.id]);
          }
        } else {
          if (Math.random() > 0.4) { 
            await pool.query(`UPDATE workers_services SET unassigned_at = NOW() WHERE service_id = $1 AND unassigned_at IS NULL`, [s.id]);
            await pool.query(`UPDATE services SET status = 'done' WHERE id = $1`, [s.id]);
          }
        }
      }

      return { message: 'Dados evoluídos um passo cronológico com sucesso!' };
    } catch (err: any) {
      throw new HttpError(500, err.message);
    }
  }
}
