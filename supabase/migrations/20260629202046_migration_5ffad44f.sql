-- Function: Update session summary stats
CREATE OR REPLACE FUNCTION update_session_summary()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE swing_sessions
  SET 
    total_shots = (SELECT COUNT(*) FROM swing_metrics WHERE session_id = COALESCE(NEW.session_id, OLD.session_id)),
    avg_ball_speed = (SELECT AVG(ball_speed) FROM swing_metrics WHERE session_id = COALESCE(NEW.session_id, OLD.session_id)),
    avg_club_speed = (SELECT AVG(club_speed) FROM swing_metrics WHERE session_id = COALESCE(NEW.session_id, OLD.session_id)),
    avg_carry_distance = (SELECT AVG(carry_distance) FROM swing_metrics WHERE session_id = COALESCE(NEW.session_id, OLD.session_id)),
    avg_total_distance = (SELECT AVG(total_distance) FROM swing_metrics WHERE session_id = COALESCE(NEW.session_id, OLD.session_id)),
    avg_launch_angle = (SELECT AVG(launch_angle) FROM swing_metrics WHERE session_id = COALESCE(NEW.session_id, OLD.session_id)),
    avg_spin_rate = (SELECT AVG(spin_rate)::INTEGER FROM swing_metrics WHERE session_id = COALESCE(NEW.session_id, OLD.session_id)),
    consistency_score = calculate_consistency_score(COALESCE(NEW.session_id, OLD.session_id)),
    updated_at = NOW()
  WHERE id = COALESCE(NEW.session_id, OLD.session_id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_session_stats_after_metric_change ON swing_metrics;
CREATE TRIGGER update_session_stats_after_metric_change
  AFTER INSERT OR UPDATE OR DELETE ON swing_metrics
  FOR EACH ROW
  EXECUTE FUNCTION update_session_summary();