package Backend.repository;

import Backend.model.HistoryLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface HistoryLogRepository extends JpaRepository<HistoryLog, Long> {
    // Find logs for a specific item, ordered by newest first
    List<HistoryLog> findByInventoryIdOrderByTimestampDesc(Long inventoryId);
}