-- Change putter_sole_flush from boolean to text with CHECK constraint
ALTER TABLE fitting_sessions 
  ALTER COLUMN putter_sole_flush TYPE text USING 
    CASE 
      WHEN putter_sole_flush = true THEN 'flat'
      WHEN putter_sole_flush = false THEN 'toe_up'
      ELSE NULL
    END;

-- Add CHECK constraint for valid values
ALTER TABLE fitting_sessions
  ADD CONSTRAINT fitting_sessions_putter_sole_flush_check 
  CHECK (putter_sole_flush IN ('toe_up', 'flat', 'heel_up', 'unsure'));