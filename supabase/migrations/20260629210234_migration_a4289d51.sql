-- Create function to check and award badges
CREATE OR REPLACE FUNCTION check_badge_eligibility()
RETURNS TRIGGER AS $$
DECLARE
  v_session_count INTEGER;
  v_avg_club_speed NUMERIC;
  v_avg_distance NUMERIC;
  v_avg_consistency NUMERIC;
  v_unique_clubs INTEGER;
  v_optimal_launches INTEGER;
BEGIN
  -- Get user's stats
  SELECT COUNT(DISTINCT id) INTO v_session_count
  FROM swing_sessions WHERE user_id = NEW.user_id;
  
  SELECT AVG(avg_club_speed) INTO v_avg_club_speed
  FROM swing_sessions WHERE user_id = NEW.user_id;
  
  SELECT AVG(avg_total_distance) INTO v_avg_distance
  FROM swing_sessions WHERE user_id = NEW.user_id;
  
  SELECT AVG(consistency_score) INTO v_avg_consistency
  FROM swing_sessions WHERE user_id = NEW.user_id;
  
  -- First session badge
  IF v_session_count = 1 THEN
    INSERT INTO achievement_badges (user_id, badge_type, badge_name, badge_description, badge_icon)
    VALUES (NEW.user_id, 'first_session', 'First Steps', 'Logged your first swing session', '🎯')
    ON CONFLICT (user_id, badge_type) DO NOTHING;
  END IF;
  
  -- Dedicated badges (session count)
  IF v_session_count >= 10 THEN
    INSERT INTO achievement_badges (user_id, badge_type, badge_name, badge_description, badge_icon, metric_value)
    VALUES (NEW.user_id, 'data_collector_10', 'Data Collector Bronze', 'Logged 10 swing sessions', '📊', 10)
    ON CONFLICT (user_id, badge_type) DO NOTHING;
  END IF;
  
  IF v_session_count >= 50 THEN
    INSERT INTO achievement_badges (user_id, badge_type, badge_name, badge_description, badge_icon, metric_value)
    VALUES (NEW.user_id, 'data_collector_50', 'Data Collector Silver', 'Logged 50 swing sessions', '📊', 50)
    ON CONFLICT (user_id, badge_type) DO NOTHING;
  END IF;
  
  IF v_session_count >= 100 THEN
    INSERT INTO achievement_badges (user_id, badge_type, badge_name, badge_description, badge_icon, metric_value)
    VALUES (NEW.user_id, 'data_collector_100', 'Data Collector Gold', 'Logged 100 swing sessions', '📊', 100)
    ON CONFLICT (user_id, badge_type) DO NOTHING;
  END IF;
  
  -- Speed Demon badges
  IF v_avg_club_speed >= 110 THEN
    INSERT INTO achievement_badges (user_id, badge_type, badge_name, badge_description, badge_icon, metric_value)
    VALUES (NEW.user_id, 'speed_demon_110', 'Speed Demon Platinum', 'Average club speed 110+ mph', '⚡', v_avg_club_speed)
    ON CONFLICT (user_id, badge_type) DO NOTHING;
  ELSIF v_avg_club_speed >= 100 THEN
    INSERT INTO achievement_badges (user_id, badge_type, badge_name, badge_description, badge_icon, metric_value)
    VALUES (NEW.user_id, 'speed_demon_100', 'Speed Demon Gold', 'Average club speed 100+ mph', '⚡', v_avg_club_speed)
    ON CONFLICT (user_id, badge_type) DO NOTHING;
  ELSIF v_avg_club_speed >= 90 THEN
    INSERT INTO achievement_badges (user_id, badge_type, badge_name, badge_description, badge_icon, metric_value)
    VALUES (NEW.user_id, 'speed_demon_90', 'Speed Demon Silver', 'Average club speed 90+ mph', '⚡', v_avg_club_speed)
    ON CONFLICT (user_id, badge_type) DO NOTHING;
  ELSIF v_avg_club_speed >= 80 THEN
    INSERT INTO achievement_badges (user_id, badge_type, badge_name, badge_description, badge_icon, metric_value)
    VALUES (NEW.user_id, 'speed_demon_80', 'Speed Demon Bronze', 'Average club speed 80+ mph', '⚡', v_avg_club_speed)
    ON CONFLICT (user_id, badge_type) DO NOTHING;
  END IF;
  
  -- Distance Master badges
  IF v_avg_distance >= 300 THEN
    INSERT INTO achievement_badges (user_id, badge_type, badge_name, badge_description, badge_icon, metric_value)
    VALUES (NEW.user_id, 'distance_300', 'Distance Master Platinum', 'Average distance 300+ yards', '🏌️', v_avg_distance)
    ON CONFLICT (user_id, badge_type) DO NOTHING;
  ELSIF v_avg_distance >= 275 THEN
    INSERT INTO achievement_badges (user_id, badge_type, badge_name, badge_description, badge_icon, metric_value)
    VALUES (NEW.user_id, 'distance_275', 'Distance Master Gold', 'Average distance 275+ yards', '🏌️', v_avg_distance)
    ON CONFLICT (user_id, badge_type) DO NOTHING;
  ELSIF v_avg_distance >= 250 THEN
    INSERT INTO achievement_badges (user_id, badge_type, badge_name, badge_description, badge_icon, metric_value)
    VALUES (NEW.user_id, 'distance_250', 'Distance Master Silver', 'Average distance 250+ yards', '🏌️', v_avg_distance)
    ON CONFLICT (user_id, badge_type) DO NOTHING;
  ELSIF v_avg_distance >= 200 THEN
    INSERT INTO achievement_badges (user_id, badge_type, badge_name, badge_description, badge_icon, metric_value)
    VALUES (NEW.user_id, 'distance_200', 'Distance Master Bronze', 'Average distance 200+ yards', '🏌️', v_avg_distance)
    ON CONFLICT (user_id, badge_type) DO NOTHING;
  END IF;
  
  -- Consistency badges
  IF v_avg_consistency >= 95 THEN
    INSERT INTO achievement_badges (user_id, badge_type, badge_name, badge_description, badge_icon, metric_value)
    VALUES (NEW.user_id, 'consistency_gold', 'Consistency King Platinum', 'Average consistency 95+', '🎯', v_avg_consistency)
    ON CONFLICT (user_id, badge_type) DO NOTHING;
  ELSIF v_avg_consistency >= 90 THEN
    INSERT INTO achievement_badges (user_id, badge_type, badge_name, badge_description, badge_icon, metric_value)
    VALUES (NEW.user_id, 'consistency_gold', 'Consistency King Gold', 'Average consistency 90+', '🎯', v_avg_consistency)
    ON CONFLICT (user_id, badge_type) DO NOTHING;
  ELSIF v_avg_consistency >= 85 THEN
    INSERT INTO achievement_badges (user_id, badge_type, badge_name, badge_description, badge_icon, metric_value)
    VALUES (NEW.user_id, 'consistency_silver', 'Consistency King Silver', 'Average consistency 85+', '🎯', v_avg_consistency)
    ON CONFLICT (user_id, badge_type) DO NOTHING;
  ELSIF v_avg_consistency >= 80 THEN
    INSERT INTO achievement_badges (user_id, badge_type, badge_name, badge_description, badge_icon, metric_value)
    VALUES (NEW.user_id, 'consistency_bronze', 'Consistency King Bronze', 'Average consistency 80+', '🎯', v_avg_consistency)
    ON CONFLICT (user_id, badge_type) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on swing_sessions
DROP TRIGGER IF EXISTS award_badges_on_session ON swing_sessions;
CREATE TRIGGER award_badges_on_session
  AFTER INSERT OR UPDATE ON swing_sessions
  FOR EACH ROW
  EXECUTE FUNCTION check_badge_eligibility();

-- Create function to update goal progress
CREATE OR REPLACE FUNCTION update_goal_progress()
RETURNS TRIGGER AS $$
DECLARE
  v_goal RECORD;
  v_current_value NUMERIC;
  v_progress NUMERIC;
BEGIN
  -- Loop through active goals for this user
  FOR v_goal IN 
    SELECT * FROM swing_goals 
    WHERE user_id = NEW.user_id 
    AND status = 'active'
  LOOP
    -- Calculate current value based on metric
    CASE v_goal.metric_name
      WHEN 'club_speed' THEN
        SELECT AVG(avg_club_speed) INTO v_current_value
        FROM swing_sessions WHERE user_id = NEW.user_id;
      WHEN 'ball_speed' THEN
        SELECT AVG(avg_ball_speed) INTO v_current_value
        FROM swing_sessions WHERE user_id = NEW.user_id;
      WHEN 'carry_distance' THEN
        SELECT AVG(avg_carry_distance) INTO v_current_value
        FROM swing_sessions WHERE user_id = NEW.user_id;
      WHEN 'total_distance' THEN
        SELECT AVG(avg_total_distance) INTO v_current_value
        FROM swing_sessions WHERE user_id = NEW.user_id;
      WHEN 'consistency_score' THEN
        SELECT AVG(consistency_score) INTO v_current_value
        FROM swing_sessions WHERE user_id = NEW.user_id;
      ELSE
        v_current_value := 0;
    END CASE;
    
    -- Calculate progress percentage
    IF v_goal.start_value IS NOT NULL AND v_goal.start_value != v_goal.target_value THEN
      v_progress := ((v_current_value - v_goal.start_value) / (v_goal.target_value - v_goal.start_value)) * 100;
    ELSE
      v_progress := (v_current_value / v_goal.target_value) * 100;
    END IF;
    
    v_progress := LEAST(100, GREATEST(0, v_progress));
    
    -- Update goal
    UPDATE swing_goals 
    SET 
      current_value = v_current_value,
      progress_percent = v_progress,
      updated_at = NOW(),
      completed_date = CASE 
        WHEN v_progress >= 100 AND completed_date IS NULL THEN CURRENT_DATE 
        ELSE completed_date 
      END,
      status = CASE 
        WHEN v_progress >= 100 THEN 'completed'
        WHEN CURRENT_DATE > target_date AND v_progress < 100 THEN 'abandoned'
        ELSE status 
      END
    WHERE id = v_goal.id;
    
    -- Award goal achievement badge
    IF v_progress >= 100 THEN
      INSERT INTO achievement_badges (user_id, badge_type, badge_name, badge_description, badge_icon)
      SELECT 
        NEW.user_id,
        'goal_achiever_' || (SELECT COUNT(*) FROM swing_goals WHERE user_id = NEW.user_id AND status = 'completed'),
        'Goal Achiever',
        'Completed a swing improvement goal',
        '🏆'
      WHERE NOT EXISTS (
        SELECT 1 FROM achievement_badges 
        WHERE user_id = NEW.user_id 
        AND badge_type LIKE 'goal_achiever_%'
        AND earned_date = CURRENT_DATE
      );
    END IF;
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for goal progress
DROP TRIGGER IF EXISTS update_goals_on_session ON swing_sessions;
CREATE TRIGGER update_goals_on_session
  AFTER INSERT OR UPDATE ON swing_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_goal_progress();