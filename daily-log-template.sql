-- Drop existing table if it exists
DROP TABLE IF EXISTS rollbit_distribution_raffle;

-- Create the table with all columns
CREATE TABLE rollbit_distribution_raffle (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    lottery NUMERIC(20,2),
    marketshare NUMERIC(20,2),
    rollbox NUMERIC(20,2),
    v2_profitshare NUMERIC(20,2),
    freebet NUMERIC(20,2),
    total NUMERIC(20,2),
    rlb_earned NUMERIC(20,2),
    avg_rlb_claim NUMERIC(20,2),
    rlb_balance NUMERIC(20,2),
    pot_size NUMERIC(20,2),
    rollbit_balance NUMERIC(20,2),
    dao_fund NUMERIC(20,2),
    payout_wallet NUMERIC(20,2),
    incentivization_bucket NUMERIC(20,2),
    top10_payout NUMERIC(20,2),
    lottery_number INTEGER,
    date_lottery DATE,
    position INTEGER,
    lottery_date DATE,
    lottery_position INTEGER,
    lottery_win NUMERIC(20,2),
    kong_payout_pool NUMERIC(20,2),
    kong_pool NUMERIC(20,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create an index on the date column for better query performance
CREATE INDEX IF NOT EXISTS idx_rollbit_distribution_date ON rollbit_distribution_raffle(date);

-- Add a unique constraint to prevent duplicate dates
ALTER TABLE rollbit_distribution_raffle ADD CONSTRAINT unique_date_rollbit UNIQUE (date);

-- Daily logging template
INSERT INTO rollbit_distribution_raffle (
  date,              -- Today's date
  lottery,           -- Lottery amount
  marketshare,       -- Marketshare amount
  rollbox,           -- Rollbox amount
  v2_profitshare,    -- V2 Profitshare amount
  freebet,           -- Freebet amount
  total,             -- Total amount
  rlb_earned,        -- RLB earned
  avg_rlb_claim,     -- Average RLB claim
  rlb_balance,       -- RLB balance
  pot_size,          -- Pot size
  rollbit_balance,   -- Rollbit balance
  dao_fund,          -- DAO fund
  payout_wallet,     -- Payout wallet
  incentivization_bucket,  -- Incentivization bucket
  top10_payout,      -- Top 10 payout
  lottery_number,    -- Lottery number
  date_lottery,      -- Date of lottery
  position,          -- Position
  lottery_date,      -- Lottery date
  lottery_position,  -- Lottery position
  lottery_win,       -- Lottery win amount
  kong_payout_pool,  -- Kong payout pool
  kong_pool         -- Kong pool
)
VALUES (
  CURRENT_DATE,      -- Today's date
  0.00,              -- Replace with lottery amount
  0.00,              -- Replace with marketshare
  0.00,              -- Replace with rollbox
  0.00,              -- Replace with v2_profitshare
  0.00,              -- Replace with freebet
  0.00,              -- Replace with total
  0.00,              -- Replace with rlb_earned
  0.00,              -- Replace with avg_rlb_claim
  0.00,              -- Replace with rlb_balance
  0.00,              -- Replace with pot_size
  0.00,              -- Replace with rollbit_balance
  0.00,              -- Replace with dao_fund
  0.00,              -- Replace with payout_wallet
  0.00,              -- Replace with incentivization_bucket
  0.00,              -- Replace with top10_payout
  0,                 -- Replace with lottery_number
  NULL,              -- Replace with date of lottery
  0,                 -- Replace with position
  NULL,              -- Replace with lottery date
  0,                 -- Replace with lottery position
  0.00,              -- Replace with lottery win amount
  0.00,              -- Replace with kong payout pool
  0.00               -- Replace with kong pool
);

-- Quick verification query - shows today's entry with all columns
SELECT 
    date,
    lottery,
    marketshare,
    rollbox,
    v2_profitshare,
    freebet,
    total,
    rlb_earned,
    avg_rlb_claim,
    rlb_balance,
    pot_size,
    rollbit_balance,
    dao_fund,
    payout_wallet,
    incentivization_bucket,
    top10_payout,
    lottery_number,
    date_lottery,
    position,
    lottery_date,
    lottery_position,
    lottery_win,
    kong_payout_pool,
    kong_pool
FROM rollbit_distribution_raffle 
WHERE date = CURRENT_DATE
ORDER BY created_at DESC
LIMIT 1;

-- Quick verification query - shows last 7 days of entries
SELECT 
    date,
    lottery,
    marketshare,
    rollbox,
    v2_profitshare,
    freebet,
    total,
    rlb_earned,
    avg_rlb_claim,
    rlb_balance,
    pot_size,
    rollbit_balance,
    dao_fund,
    payout_wallet,
    incentivization_bucket,
    lottery_number,
    date_lottery,
    position,
    lottery_date,
    lottery_position,
    lottery_win,
    kong_payout_pool,
    kong_pool
FROM rollbit_distribution_raffle 
WHERE date >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY date DESC; 