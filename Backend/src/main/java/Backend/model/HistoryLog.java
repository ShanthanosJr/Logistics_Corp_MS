package Backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class HistoryLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String action;      // e.g., "ITEM_UPDATED", "STOCK_ADDED"
    private String details;     // e.g., "Changed Qty from 50 to 45"
    private String performedBy; // e.g., "admin@company.com" (or User ID)
    private Long inventoryId;   // The ID of the item being changed
    private LocalDateTime timestamp;

    public HistoryLog() {}

    public HistoryLog(String action, String details, String performedBy, Long inventoryId) {
        this.action = action;
        this.details = details;
        this.performedBy = performedBy;
        this.inventoryId = inventoryId;
        this.timestamp = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }
    
    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }
    
    public String getPerformedBy() { return performedBy; }
    public void setPerformedBy(String performedBy) { this.performedBy = performedBy; }
    
    public Long getInventoryId() { return inventoryId; }
    public void setInventoryId(Long inventoryId) { this.inventoryId = inventoryId; }
    
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}