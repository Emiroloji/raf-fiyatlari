import { toObjects } from '../db.js';

const SORTS = {
  newest: 'p.id DESC',
  price_asc: 'p.sell_price ASC',
  price_desc: 'p.sell_price DESC',
  battery_desc: 'p.battery IS NULL, p.battery DESC',
  brand: 'p.brand COLLATE NOCASE ASC, p.model COLLATE NOCASE ASC',
};

const SELECT = `
  SELECT p.*, b.name AS branch_name
  FROM phones p JOIN branches b ON b.id = p.branch_id
`;

const INSERT = `
  INSERT INTO phones (branch_id, brand, model, storage_gb, battery, warranty, buy_price, sell_price, note)
  VALUES (:branch_id, :brand, :model, :storage_gb, :battery, :warranty, :buy_price, :sell_price, :note)
`;

const UPDATE = `
  UPDATE phones SET
    branch_id = :branch_id, brand = :brand, model = :model, storage_gb = :storage_gb,
    battery = :battery, warranty = :warranty, buy_price = :buy_price, sell_price = :sell_price,
    note = :note, updated_at = datetime('now', 'localtime')
  WHERE id = :id
`;

export function createPhoneRepository(db) {
  const query = async (sql, args = {}) => toObjects(await db.execute({ sql, args }));

  return {
    /** Filtrelere göre telefonları listeler. Tüm filtreler isteğe bağlıdır. */
    list(filters = {}) {
      const where = [];
      const args = {};

      if (filters.q) {
        where.push("(p.brand || ' ' || p.model) LIKE :q");
        args.q = `%${filters.q}%`;
      }
      if (filters.branch_id) { where.push('p.branch_id = :branch_id'); args.branch_id = filters.branch_id; }
      if (filters.brand) { where.push('p.brand = :brand COLLATE NOCASE'); args.brand = filters.brand; }
      if (filters.storage_gb) { where.push('p.storage_gb = :storage_gb'); args.storage_gb = filters.storage_gb; }
      if (filters.warranty === 0 || filters.warranty === 1) { where.push('p.warranty = :warranty'); args.warranty = filters.warranty; }
      if (filters.min_battery) { where.push('p.battery >= :min_battery'); args.min_battery = filters.min_battery; }
      if (filters.min_price) { where.push('p.sell_price >= :min_price'); args.min_price = filters.min_price; }
      if (filters.max_price) { where.push('p.sell_price <= :max_price'); args.max_price = filters.max_price; }

      const order = SORTS[filters.sort] || SORTS.newest;
      return query(`${SELECT} ${where.length ? `WHERE ${where.join(' AND ')}` : ''} ORDER BY ${order}`, args);
    },

    async findById(id) {
      const [phone] = await query(`${SELECT} WHERE p.id = :id`, { id });
      return phone ?? null;
    },

    async create(phone) {
      const { lastInsertRowid } = await db.execute({ sql: INSERT, args: phone });
      return this.findById(Number(lastInsertRowid));
    },

    async update(id, phone) {
      const { rowsAffected } = await db.execute({ sql: UPDATE, args: { ...phone, id } });
      return rowsAffected ? this.findById(id) : null;
    },

    async remove(id) {
      const { rowsAffected } = await db.execute({ sql: 'DELETE FROM phones WHERE id = ?', args: [id] });
      return rowsAffected > 0;
    },

    async filterOptions() {
      const [brands, storages] = await Promise.all([
        query('SELECT DISTINCT brand FROM phones ORDER BY brand COLLATE NOCASE'),
        query('SELECT DISTINCT storage_gb FROM phones ORDER BY storage_gb'),
      ]);
      return {
        brands: brands.map((r) => r.brand),
        storages: storages.map((r) => r.storage_gb),
      };
    },
  };
}
