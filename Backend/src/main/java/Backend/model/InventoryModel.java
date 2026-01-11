package Backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.GenerationType; // Ensure this import
import jakarta.persistence.Transient; // <--- Import this

@Entity
public class InventoryModel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // <--- CHANGE TO THIS
    private Long id;
    private String itemId;
    private String itemImage;
    private String itemName;
    private String itemCategory;
    private String itemQty;
    @Column(length = 5000) // <-- This allows ~1000 words
    private String itemDetails;

    @Transient // This ensures JPA ignores this field for the 'inventory' table
    private String performedBy;

    public InventoryModel(){

    }

    public Long getId() {
        return id;
    }

    public String getItemId() {
        return itemId;
    }

    public String getItemImage() {
        return itemImage;
    }

    public String getItemName() {
        return itemName;
    }

    public String getItemCategory() {
        return itemCategory;
    }

    public String getItemQty() {
        return itemQty;
    }

    public String getItemDetails() {
        return itemDetails;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setItemId(String itemId) {
        this.itemId = itemId;
    }

    public void setItemImage(String itemImage) {
        this.itemImage = itemImage;
    }

    public void setItemName(String itemName) {
        this.itemName = itemName;
    }

    public void setItemCategory(String itemCategory) {
        this.itemCategory = itemCategory;
    }

    public void setItemQty(String itemQty) {
        this.itemQty = itemQty;
    }

    public void setItemDetails(String itemDetails) {
        this.itemDetails = itemDetails;
    }

    // --- Add Getters and Setters for performedBy ---
    public String getPerformedBy() {
        return performedBy;
    }

    public void setPerformedBy(String performedBy) {
        this.performedBy = performedBy;
    }
    
    public InventoryModel(Long id, String itemId, String itemImage, String itemName, String itemCategory, String itemQty, String itemDetails) {
        this.id = id;
        this.itemId = itemId;
        this.itemImage = itemImage;
        this.itemName = itemName;
        this.itemCategory = itemCategory;
        this.itemQty = itemQty;
        this.itemDetails = itemDetails;
    }
}
