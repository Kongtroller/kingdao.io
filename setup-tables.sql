-- investments table
create table investments (
  id uuid default uuid_generate_v4() primary key,
  date date not null,
  asset text not null,
  amount numeric not null,
  value numeric not null,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- expenses table
create table expenses (
  id uuid default uuid_generate_v4() primary key,
  date date not null,
  category text not null,
  amount numeric not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- revenue table
create table revenue (
  id uuid default uuid_generate_v4() primary key,
  date date not null,
  source text not null,
  amount numeric not null,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Drop existing tables if they exist
drop table if exists lottery_tracking;

-- lottery_tracking table
create table lottery_tracking (
  id uuid default uuid_generate_v4() primary key,
  date date not null,
  lottery numeric,
  marketshare numeric,
  rollbox numeric,
  v2_profitshare numeric,
  free_bet numeric,
  total numeric,
  rlb_earned numeric,
  avg_rlb_claim numeric,
  rlb_balance numeric,
  pot_size numeric,
  rollbit_balance numeric,
  dao_fund numeric,
  payout_wallet numeric,
  incentivization_bucket numeric,
  top10_payout numeric,
  lottery_number integer,
  position integer,
  win numeric,
  kong_payout_pool numeric,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create index on date for better query performance
create index lottery_tracking_date_idx on lottery_tracking(date);

-- Example insert query
insert into lottery_tracking (
  date, lottery, marketshare, rollbox, v2_profitshare, free_bet,
  total, rlb_earned, avg_rlb_claim, rlb_balance, pot_size,
  rollbit_balance, dao_fund, payout_wallet, incentivization_bucket,
  top10_payout, lottery_number, position, win, kong_payout_pool
) values (
  '2022-02-22', 61.80, 6.18, null, null, 67.98,
  13475.57, 0, 27700, null, null,
  40.79, 20.39, 6.80, null,
  null, 279, 10, 210.43, 504.17
);

-- Query to view all data ordered by date
select * from lottery_tracking 
order by date desc;

-- Query to get daily totals
select 
  date,
  sum(lottery) as daily_lottery,
  sum(marketshare) as daily_marketshare,
  sum(total) as daily_total,
  sum(rlb_earned) as daily_rlb,
  sum(win) as daily_winnings
from lottery_tracking
group by date
order by date desc;

-- Query to get monthly totals
select 
  date_trunc('month', date) as month,
  sum(lottery) as monthly_lottery,
  sum(marketshare) as monthly_marketshare,
  sum(total) as monthly_total,
  sum(rlb_earned) as monthly_rlb,
  sum(win) as monthly_winnings,
  count(*) as days_in_month
from lottery_tracking
group by date_trunc('month', date)
order by month desc;

-- Query to get monthly averages
select 
  date_trunc('month', date) as month,
  avg(lottery) as avg_daily_lottery,
  avg(marketshare) as avg_daily_marketshare,
  avg(total) as avg_daily_total,
  avg(rlb_earned) as avg_daily_rlb,
  avg(win) as avg_daily_winnings,
  count(*) as days_in_month
from lottery_tracking
group by date_trunc('month', date)
order by month desc;

-- Query to get running totals by month
select 
  date_trunc('month', date) as month,
  sum(lottery) as monthly_lottery,
  sum(sum(lottery)) over (order by date_trunc('month', date)) as cumulative_lottery,
  sum(marketshare) as monthly_marketshare,
  sum(sum(marketshare)) over (order by date_trunc('month', date)) as cumulative_marketshare,
  sum(total) as monthly_total,
  sum(sum(total)) over (order by date_trunc('month', date)) as cumulative_total,
  sum(win) as monthly_winnings,
  sum(sum(win)) over (order by date_trunc('month', date)) as cumulative_winnings
from lottery_tracking
group by date_trunc('month', date)
order by month desc; 