const { querySql } = require('./query_db');
async function run() {
  const r = await querySql("SELECT id, title, price, status FROM public.products WHERE status = 'active' LIMIT 5;");
  console.log(r.data);
}
run();
